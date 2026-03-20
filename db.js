const sql = require("mssql");
require("dotenv").config();

const connectionString = process.env.DATABASE_URL;

const config = connectionString
  ? connectionString
  : {
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      options: {
        encrypt: process.env.DATABASE_URL ? true : false,
        trustServerCertificate: true,
      },
    };

async function connectDB() {
  try {
    let pool = await sql.connect(config);
    console.log("Connected to DB successfully!");
    return pool;
  } catch (err) {
    console.error("Critical DB Error:", err.message);
    throw err;
  }
}

module.exports = { connectDB };
