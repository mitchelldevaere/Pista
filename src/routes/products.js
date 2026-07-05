// src/routes/products.js
const express = require("express");
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const requireFields = require("../utils/requireFields");

const router = express.Router();

// Get all active products along with their associated sauce information
router.get("/", asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  let rows;
  try {
    const query = `
      SELECT
        p.id AS product_id, p.naam AS product_naam, p.prijs AS product_prijs, p.soort AS product_soort,
        s.id AS saus_id, s.saus AS saus_naam, s.prijs AS saus_prijs, p.actief AS product_actief
      FROM product AS p
      LEFT JOIN product_to_saus AS pts ON p.id = pts.product_id
      LEFT JOIN saus AS s ON pts.saus_id = s.id
      WHERE p.actief = 1
    `;
    rows = await conn.query(query);
  } finally {
    conn.release();
  }

  // Organize the data into a structure that groups products and their sauces
  const productsWithSauces = {};
  rows.forEach((row) => {
    if (!productsWithSauces[row.product_id]) {
      productsWithSauces[row.product_id] = {
        id: row.product_id,
        naam: row.product_naam,
        prijs: row.product_prijs,
        soort: row.product_soort,
        sauzen: [],
      };
    }
    if (row.saus_id) {
      productsWithSauces[row.product_id].sauzen.push({
        id: row.saus_id,
        saus: row.saus_naam,
        prijs: row.saus_prijs,
      });
    }
  });

  res.json(Object.values(productsWithSauces));
}));

router.get("/soort/:soort", asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query("SELECT * FROM product WHERE soort = ?", [req.params.soort]);
    res.json(rows);
  } finally {
    conn.release();
  }
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query("SELECT * FROM product WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(rows[0]);
  } finally {
    conn.release();
  }
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("DELETE FROM product WHERE id = ?", [req.params.id]);
    res.status(204).end();
  } finally {
    conn.release();
  }
}));

router.post("/", asyncHandler(async (req, res) => {
  const { naam, prijs, soort } = req.body;
  const missing = requireFields(req.body, ["naam", "prijs", "soort"]);
  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  const conn = await pool.getConnection();
  try {
    await conn.query("INSERT INTO product (naam, prijs, soort) VALUES (?, ?, ?)", [naam, prijs, soort]);
    res.status(201).json({ message: "Product created successfully" });
  } finally {
    conn.release();
  }
}));

router.put("/:id", asyncHandler(async (req, res) => {
  const { naam, prijs, soort } = req.body;
  const missing = requireFields(req.body, ["naam", "prijs", "soort"]);
  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  const conn = await pool.getConnection();
  try {
    const existingProduct = await conn.query("SELECT * FROM product WHERE id = ?", [req.params.id]);
    if (existingProduct.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    await conn.query("UPDATE product SET naam = ?, prijs = ?, soort = ? WHERE id = ?", [naam, prijs, soort, req.params.id]);
    res.status(200).json({ message: "Product updated successfully" });
  } finally {
    conn.release();
  }
}));

module.exports = router;
