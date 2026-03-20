const { connectDB } = require("./db");
const sql = require("mssql");

// Signup logic
async function spAddNewUser(full_name, email, hashed_password, age, country) {
  let pool = await connectDB();
  await pool
    .request()
    .input("full_name", sql.NVarChar, full_name)
    .input("email", sql.VarChar, email)
    .input("password", sql.NVarChar, hashed_password)
    .input("age", sql.Int, age)
    .input("country", sql.NVarChar, country)
    .execute("spAddNewUser");
}

// Edit Profile logic - FIXED to match 5 SQL parameters
async function spUpdateUser(theid, full_name, password, age, country) {
  let pool = await connectDB();
  await pool
    .request()
    .input("theid", sql.Int, theid)
    .input("full_name", sql.NVarChar, full_name)
    .input("password", sql.NVarChar, password) // This is the optional @password parameter
    .input("age", sql.Int, age)
    .input("country", sql.NVarChar, country)
    .execute("spUpdateUser");
}

// Helper to get user by email
async function spGetUserByEmail(email) {
  let pool = await connectDB();
  let result = await pool
    .request()
    .input("email", sql.VarChar, email)
    .execute("spGetUserByEmail");
  return result.recordset[0];
}

// Account Deletion
async function spDeleteUser(theid) {
  let pool = await connectDB();
  await pool
    .request()
    .input("theid", sql.Int, theid)
    .query("DELETE FROM Users WHERE id = @theid");
}

// Function to get player scores from the Stored Procedure
async function spGetPlayerScores(userId, levelId, startDate, endDate) {
  try {
    let pool = await connectDB();
    let result = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .input("LevelId", sql.Int, levelId)
      .input("StartDate", sql.Date, startDate || null)
      .input("EndDate", sql.Date, endDate || null)
      .execute("spGetPlayerScores");

    return result.recordset;
  } catch (err) {
    console.error("Database Error in spGetPlayerScores:", err);
    throw err;
  }
}

// Game result storage logic
async function spSaveGameResult(
  userId,
  correctAnswers,
  durationSeconds,
  levelId,
) {
  let pool = await connectDB();
  await pool
    .request()
    .input("UserId", sql.Int, userId)
    .input("CorrectAnswers", sql.Int, correctAnswers)
    .input("DurationSeconds", sql.Int, durationSeconds)
    .input("LevelId", sql.Int, levelId)
    .execute("spSaveGameResult");
}

module.exports = {
  spAddNewUser,
  spUpdateUser,
  spGetUserByEmail,
  spDeleteUser,
  spGetPlayerScores,
  spSaveGameResult,
};
