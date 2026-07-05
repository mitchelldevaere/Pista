// src/config/db.js
const mariadb = require("mariadb");

const pool = mariadb.createPool({
  host: "lapista.depistezulte.be",
  user: "devlapista",
  password: "Hy_aw0648",
  database: "lapista",
  connectionLimit: 5,
});

module.exports = pool;
