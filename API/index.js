// index.js
const express = require("express");
const bodyParser = require("body-parser");
const mariadb = require("mariadb");
const cors = require("cors");

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors({
  origin: "http://192.168.10.195:3000", // Replace with your frontend's URL
}));

// Create a MariaDB pool
const pool = mariadb.createPool({
  host: "192.168.10.195",
  user: "root",
  password: "Azerty-123",
  database: "Pista",
  connectionLimit: 400, // adjust as needed
});

app.get("/api/sauzen", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM saus");
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
})

// Get all products
app.get("/api/producten", async (req, res) => {
  try {
    const conn = await pool.getConnection();

    // Retrieve all products along with their associated sauce information
    const query = `
      SELECT
        p.id AS product_id, p.naam AS product_naam, p.prijs AS product_prijs, p.soort AS product_soort,
        s.id AS saus_id, s.saus AS saus_naam, s.prijs AS saus_prijs
      FROM product AS p
      LEFT JOIN product_to_saus AS pts ON p.id = pts.product_id
      LEFT JOIN saus AS s ON pts.saus_id = s.id
    `;
    const rows = await conn.query(query);

    conn.release();

    // Organize the data into a structure that groups products and their sauces
    const productsWithSauces = {};
    rows.forEach(row => {
      if (!productsWithSauces[row.product_id]) {
        productsWithSauces[row.product_id] = {
          id: row.product_id,
          naam: row.product_naam,
          prijs: row.product_prijs,
          soort: row.product_soort,
          sauzen: []
        };
      }
      if (row.saus_id) {
        productsWithSauces[row.product_id].sauzen.push({
            id: row.saus_id,
            saus: row.saus_naam,
            prijs: row.saus_prijs
        });
      }
    });

    // Convert the grouped data object into an array
    const productArray = Object.values(productsWithSauces);

    res.json(productArray);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


app.get("/api/producten/soort/:soort", async (req, res) => {
  const productSoort = req.params.soort;

  try {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM product WHERE soort = ?", [productSoort]);
    conn.release();
    
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


app.get("/api/producten/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM product WHERE id = ?", [productId]);
    conn.release();

    if (rows.length === 0) {
      res.status(404).json({ message: "Product not found" });
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.delete("/api/producten/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const conn = await pool.getConnection();
    await conn.query("DELETE FROM product WHERE id = ?", [productId]);
    conn.release();
    res.status(204).json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/producten", async (req, res) => {
  const { naam, prijs, soort } = req.body;

  try {
    if (!naam || !prijs || !soort) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const conn = await pool.getConnection();
    await conn.query("INSERT INTO product (naam, prijs, soort) VALUES (?, ?, ?)", [naam, prijs, soort]);
    conn.release();
    res.status(201).json({ message: "Product created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
}); 

// PUT Endpoint - Updating a Product by ID
app.put("/api/producten/:id", async (req, res) => {
  const productId = req.params.id;
  const { naam, prijs, soort } = req.body;

  try {
    if (!naam || !prijs || !soort) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const conn = await pool.getConnection();

    // Check if the product exists
    const existingProduct = await conn.query("SELECT * FROM product WHERE id = ?", [productId]);
    if (existingProduct.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Product not found" });
    }

    // Update the product
    await conn.query("UPDATE product SET naam = ?, prijs = ?, soort = ? WHERE id = ?", [naam, prijs, soort, productId]);

    conn.release();
    res.status(200).json({ message: "Product updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/orders", async (req, res) => {
  const { tafel_id, creation, modification } = req.body;

  try {
    if (!tafel_id || !creation || !modification) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const conn = await pool.getConnection();

    // Insert the new order into the database
    await conn.query("INSERT INTO `order` (tafel_id, creation, modification) VALUES (?, ?, ?)", [tafel_id, creation, modification]);

    conn.release();
    res.status(201).json({ message: "Order created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
