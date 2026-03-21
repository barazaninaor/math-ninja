const { pool } = require("./db");

// Signup logic
async function spAddNewUser(full_name, email, hashed_password, age, country) {
  await pool.execute("CALL railway.spAddNewUser(?, ?, ?, ?, ?)", [
    full_name,
    email,
    hashed_password,
    age,
    country,
  ]);
}

// Edit Profile logic
async function spUpdateUser(theid, full_name, password, age, country) {
  await pool.execute("CALL railway.spUpdateUser(?, ?, ?, ?, ?)", [
    theid,
    full_name,
    password,
    age,
    country,
  ]);
}

// Helper to get user by email
async function spGetUserByEmail(email) {
  const [rows] = await pool.execute("CALL railway.spGetUserByEmail(?)", [
    email,
  ]);
  return rows[0] ? rows[0][0] : null;
}

// Account Deletion
async function spDeleteUser(theid) {
  await pool.execute("DELETE FROM users WHERE id = ?", [theid]);
}

// Function to get player scores
async function spGetPlayerScores(userId, levelId, startDate, endDate) {
  try {
    const [rows] = await pool.execute(
      "CALL railway.spGetPlayerScores(?, ?, ?, ?)",
      [userId, levelId, startDate || null, endDate || null],
    );

    const results = rows[0] || [];

    return results.map((row) => ({
      DATE: new Date(row.played_at).toLocaleDateString("en-GB"),
      DURATION: row.duration_seconds,
      SUCCESS_RATE: Math.round((row.correct_answers / 30) * 100),
      SCORE: row.correct_answers * 10,
    }));
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
  await pool.execute("CALL railway.spSaveGameResult(?, ?, ?, ?)", [
    userId,
    correctAnswers,
    durationSeconds,
    levelId,
  ]);
}

module.exports = {
  spAddNewUser,
  spUpdateUser,
  spGetUserByEmail,
  spDeleteUser,
  spGetPlayerScores,
  spSaveGameResult,
};
