// src/routes/orderlijnen.js
// Mounted at /api
const express = require("express");
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const requireFields = require("../utils/requireFields");

const router = express.Router();

router.post("/orderlijnen", asyncHandler(async (req, res) => {
  const { order_id, product_id, naam, prijs, hoeveelheid, saus, bereiding } = req.body;
  const missing = requireFields(req.body, ["order_id", "product_id", "naam", "prijs", "hoeveelheid"]);
  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  const conn = await pool.getConnection();
  try {
    await conn.query(
      "INSERT INTO orderlijnen (order_id, product_id, naam, prijs, hoeveelheid, saus, bereiding) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [order_id, product_id, naam, prijs, hoeveelheid, saus, bereiding]
    );
    res.status(201).json({ message: "Order line created successfully" });
  } finally {
    conn.release();
  }
}));

router.put("/orderlijnen/:id", asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const existingOrderLine = await conn.query("SELECT * FROM orderlijnen WHERE id = ?", [req.params.id]);
    if (existingOrderLine.length === 0) {
      return res.status(404).json({ message: "Order line not found" });
    }

    await conn.query("UPDATE orderlijnen SET status = 1 WHERE id = ?", [req.params.id]);
    res.status(200).json({ message: "Order line status updated successfully" });
  } finally {
    conn.release();
  }
}));

router.put("/orderlijnenBereiding/:id", asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const existingOrderLine = await conn.query("SELECT * FROM orderlijnen WHERE id = ?", [req.params.id]);
    if (existingOrderLine.length === 0) {
      return res.status(404).json({ message: "Order line not found" });
    }

    await conn.query("UPDATE orderlijnen SET bereiding = 1 WHERE id = ?", [req.params.id]);
    res.status(200).json({ message: "Order line status updated successfully" });
  } finally {
    conn.release();
  }
}));

module.exports = router;
