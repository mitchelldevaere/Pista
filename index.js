// index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const sauzenRouter = require("./src/routes/sauzen");
const productsRouter = require("./src/routes/products");
const ordersRouter = require("./src/routes/orders");
const orderlijnenRouter = require("./src/routes/orderlijnen");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();
const port = 3000;

const reactBuild = path.join(__dirname, "Pista_App", "build");
app.use(express.static(reactBuild));

app.use(bodyParser.json());
app.use(cors());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/sauzen", sauzenRouter);
app.use("/api/producten", productsRouter);
app.use("/api", ordersRouter);
app.use("/api", orderlijnenRouter);

app.get("*", (req, res) => {
  res.sendFile(path.join(reactBuild, "index.html"));
});

app.use(errorHandler);

const server = app.listen(port, "0.0.0.0", () => {
  console.log("Server is running");
});

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
