const mysql = require("mysql");

const DB = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: "isupport_module"
});

module.exports = DB;
