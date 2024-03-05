// index.js
const express = require("express");
const bodyParser = require("body-parser");
const mariadb = require("mariadb");
const cors = require("cors");
const path = require("path");

const app = express();
const port = 3000;

const reactBuild = path.join(__dirname, 'Pista_App', 'build')
app.use(express.static(reactBuild))

app.use(bodyParser.json());
app.use(cors());

// Create a MariaDB pool
const pool = mariadb.createPool({
  host: "lapista.depistezulte.be",
  user: "devlapista",
  password: "Hy_aw0648",
  database: "lapista",
  connectionLimit: 5, // adjust as needed
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

app.get("/api/order/:order_id", async (req, res) => {
  const orderId = req.params.order_id;

  try {
    const conn = await pool.getConnection();
    
    // Query to retrieve the order and its associated order lines
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

    const rows = await conn.query(query, [orderId]);
    conn.release();

    // Check if the order with the specified ID exists
    if (rows.length === 0) {
      res.status(404).json({ message: "Order not found" });
    } else {
      // Organize the data into a structure that represents the order and its order lines
      const orderData = {
        id: rows[0].order_id,
        tafel_id: rows[0].tafel_id,
        creation: rows[0].creation,
        modification: rows[0].modification,
        orderlines: rows.map(row => ({
          id: row.orderline_id,
          product_id: row.product_id,
          naam: row.product_naam,
          prijs: row.product_prijs,
          hoeveelheid: row.hoeveelheid,
          saus: row.saus,
          status: row.status
        }))
      };

      res.json(orderData);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


app.get("/api/orders/:tafel_id", async (req, res) => {
  const tafelId = req.params.tafel_id;

  try {
    const conn = await pool.getConnection();
    const query = "SELECT * FROM `order` WHERE tafel_id = ? ORDER BY creation DESC LIMIT 1";
    const rows = await conn.query(query, [tafelId]);
    conn.release();

    if (rows.length === 0) {
      res.status(404).json({ message: "Order not found" });
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM open_order_items");
    conn.release();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("/api/allOrders/:tafel_id", async (req, res) => {
  const tafelId = req.params.tafel_id;

  try {
    const conn = await pool.getConnection();

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

    const rows = await conn.query(query, [tafelId]);
    conn.release();

    // Organize the data into a structure that groups orders and their order lines
    const ordersWithOrderlines = {};
    rows.forEach(row => {
      if (!ordersWithOrderlines[row.order_id]) {
        ordersWithOrderlines[row.order_id] = {
          id: row.order_id,
          tafel_id: row.tafel_id,
          creation: row.creation,
          modification: row.modification,
          orderlines: []
        };
      }
      ordersWithOrderlines[row.order_id].orderlines.push({
        id: row.orderline_id,
        product_id: row.product_id,
        product_naam: row.product_naam,
        product_prijs: row.product_prijs,
        hoeveelheid: row.hoeveelheid,
        saus: row.saus,
        status: row.status
      });
    });

    // Convert the grouped data object into an array
    const ordersArray = Object.values(ordersWithOrderlines);

    res.json(ordersArray);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.post("/api/orderlijnen", async (req, res) => {
  const { order_id, product_id, naam, prijs, hoeveelheid, saus } = req.body;

  try {
    if (!order_id || !product_id || !naam || !prijs || !hoeveelheid || !saus) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const conn = await pool.getConnection();
    await conn.query(
      "INSERT INTO orderlijnen (order_id, product_id, naam, prijs, hoeveelheid, saus) VALUES (?, ?, ?, ?, ?, ?)",
      [order_id, product_id, naam, prijs, hoeveelheid, saus]
    );
    conn.release();
    
    res.status(201).json({ message: "Order line created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.put('/api/orderlijnen/:id', async (req, res) => {
  const orderLineId = req.params.id;

  try {
    const conn = await pool.getConnection();

    // Check if the order line exists
    const existingOrderLine = await conn.query("SELECT * FROM orderlijnen WHERE id = ?", [orderLineId]);
    if (existingOrderLine.length === 0) {
      conn.release();
      return res.status(404).json({ message: "Order line not found" });
    }

    // Update the status to 1
    await conn.query("UPDATE orderlijnen SET status = 1 WHERE id = ?", [orderLineId]);

    conn.release();

    res.status(200).json({ message: "Order line status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(reactBuild, 'index.html'));
});

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log('Server is running');
});
