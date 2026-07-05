// src/routes/orders.js
// Mounted at /api — keeps the original flat URL shapes (/api/order/:id, /api/orders,
// /api/ordersBar3, /api/allOrders/:tafel_id, ...) so the frontend needs no changes.
const express = require("express");
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const requireFields = require("../utils/requireFields");

const router = express.Router();

router.post("/orders", asyncHandler(async (req, res) => {
  const { tafel_id } = req.body;
  const missing = requireFields(req.body, ["tafel_id"]);
  if (missing.length > 0) {
    return res.status(400).json({ message: `Missing required fields: ${missing.join(", ")}` });
  }

  const conn = await pool.getConnection();
  try {
    await conn.query(
      "INSERT INTO `order` (tafel_id, creation, modification) VALUES (?, NOW(), NOW())",
      [tafel_id]
    );
    res.status(201).json({ message: "Order created successfully" });
  } finally {
    conn.release();
  }
}));

// Single order with its order lines
router.get("/order/:order_id", asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const query = `
      SELECT
        o.id AS order_id,
        o.tafel_id,
        o.creation,
        o.modification,
        ol.id AS orderline_id,
        ol.product_id,
        ol.naam AS product_naam,
        ol.prijs AS product_prijs,
        ol.hoeveelheid,
        ol.saus,
        ol.status
      FROM \`order\` AS o
      JOIN orderlijnen AS ol ON o.id = ol.order_id
      WHERE o.id = ?;
    `;
    const rows = await conn.query(query, [req.params.order_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      id: rows[0].order_id,
      tafel_id: rows[0].tafel_id,
      creation: rows[0].creation,
      modification: rows[0].modification,
      orderlines: rows.map((row) => ({
        id: row.orderline_id,
        product_id: row.product_id,
        naam: row.product_naam,
        prijs: row.product_prijs,
        hoeveelheid: row.hoeveelheid,
        saus: row.saus,
        status: row.status,
      })),
    });
  } finally {
    conn.release();
  }
}));

// Most recent order for a table
router.get("/orders/:tafel_id", asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query(
      "SELECT * FROM `order` WHERE tafel_id = ? ORDER BY creation DESC LIMIT 1",
      [req.params.tafel_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(rows[0]);
  } finally {
    conn.release();
  }
}));

router.get("/orders", asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query("SELECT * FROM open_order_items");
    res.json(rows);
  } finally {
    conn.release();
  }
}));

router.get("/ordersBar3", asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query("SELECT * FROM open_order_items_bar3");
    res.json(rows);
  } finally {
    conn.release();
  }
}));

router.get("/ordersBar1And2", asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query("SELECT * FROM open_order_items_bar12");
    res.json(rows);
  } finally {
    conn.release();
  }
}));

// All orders (with order lines) for a table
router.get("/allOrders/:tafel_id", asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const query = `
      SELECT
        o.id AS order_id,
        o.tafel_id,
        o.creation,
        o.modification,
        ol.id AS orderline_id,
        ol.product_id,
        ol.naam AS product_naam,
        ol.prijs AS product_prijs,
        ol.hoeveelheid,
        ol.saus,
        ol.status
      FROM \`order\` AS o
      JOIN orderlijnen AS ol ON o.id = ol.order_id
      WHERE o.tafel_id = ?;
    `;
    const rows = await conn.query(query, [req.params.tafel_id]);

    const ordersWithOrderlines = {};
    rows.forEach((row) => {
      if (!ordersWithOrderlines[row.order_id]) {
        ordersWithOrderlines[row.order_id] = {
          id: row.order_id,
          tafel_id: row.tafel_id,
          creation: row.creation,
          modification: row.modification,
          orderlines: [],
        };
      }
      ordersWithOrderlines[row.order_id].orderlines.push({
        id: row.orderline_id,
        product_id: row.product_id,
        product_naam: row.product_naam,
        product_prijs: row.product_prijs,
        hoeveelheid: row.hoeveelheid,
        saus: row.saus,
        status: row.status,
      });
    });

    res.json(Object.values(ordersWithOrderlines));
  } finally {
    conn.release();
  }
}));

module.exports = router;
