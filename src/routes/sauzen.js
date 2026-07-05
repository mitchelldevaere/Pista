// src/routes/sauzen.js
const express = require("express");
const pool = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

router.get("/", asyncHandler(async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const rows = await conn.query("SELECT * FROM saus");
    res.json(rows);
  } finally {
    conn.release();
  }
}));

module.exports = router;
