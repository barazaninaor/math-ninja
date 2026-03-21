const mysql = require("mysql2/promise"); // גרסת ה-Promise מאפשרת להשתמש ב-async/await
require("dotenv").config();

// הגדרות החיבור - תומך גם בקישור ישיר וגם במשתנים נפרדים
const config = {
  host: process.env.MYSQLHOST || process.env.DB_SERVER,
  user: process.env.MYSQLUSER || process.env.DB_USER,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
  database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// יצירת ה-Pool (מאגר חיבורים)
const pool = mysql.createPool(config);

async function connectDB() {
  try {
    // ב-MySQL2 אנחנו בודקים את החיבור על ידי פקודה פשוטה
    const connection = await pool.getConnection();
    console.log("Connected to MySQL (Railway) successfully!");
    connection.release(); // משחרר את החיבור בחזרה למאגר
    return pool;
  } catch (err) {
    console.error("Critical MySQL Error:", err.message);
    throw err;
  }
}

module.exports = { connectDB, pool };
