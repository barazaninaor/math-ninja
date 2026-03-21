const { pool } = require("./db");

// 1. Signup - Keep your original procedure
async function spAddNewUser(full_name, email, hashed_password, age, country) {
  await pool.execute("CALL railway.spAddNewUser(?, ?, ?, ?, ?)", [
    full_name,
    email,
    hashed_password,
    age,
    country,
  ]);
}

// 2. Login - The most stable version for Railway procedures
async function spGetUserByEmail(email) {
  const [rows] = await pool.execute("CALL railway.spGetUserByEmail(?)", [email]);
  
  // Standard check for MySQL procedure results
  if (!rows || rows.length === 0) return null;
  
  // If the data is in rows[0][0], return it. Otherwise, try rows[0].
  const user = (rows[0] && rows[0][0]) ? rows[0][0] : rows[0];
  return user || null;
}

// 3. Edit Profile - FIXED: Direct update to bypass procedure issues
async function spUpdateUser(theid, full_name, password, age, country) {
  const sql = `UPDATE users SET full_name = ?, password = ?, age = ?, country = ? WHERE id = ?`;
  
  // We use || to ensure we NEVER send NULL, which caused your ER_BAD_NULL_ERROR
  await pool.execute(sql, [
    full_name || "",
    password || "",
    age || 0,
    country || "",
    theid
  ]);
}

// 4. Delete - Direct and simple
async function spDeleteUser(theid) {
  // Direct SQL - bypasses the broken procedure in Railway
  const sql = "DELETE FROM users WHERE id = ?";
  await pool.execute(sql, [theid]);
}

// 5. Player Scores - Your original code
async function spGetPlayerScores(userId, levelId, startDate, endDate) {
  try {
    const [rows] = await pool.execute(
      "CALL railway.spGetPlayerScores(?, ?, ?, ?)",
      [userId, levelId, startDate || null, endDate || null],
    );

    const results = rows[0] || [];

    return results.map((row) => {
      const correct = row.correct_answers;
      const duration = row.duration_seconds;
      const totalQuestions = 30;
      let finalScore = 100 - ((totalQuestions - correct) * 3);
      if (duration > 300) finalScore -= Math.floor((duration - 300) / 10);
      
      return {
        DATE: new Date(row.played_at).toLocaleDateString("en-GB"),
        DURATION: duration,
        SUCCESS_RATE: Math.round((correct / totalQuestions) * 100),
        SCORE: Math.max(0, finalScore),
      };
    });
  } catch (err) {
    console.error("Database Error:", err);
    throw err;
  }
}

// 6. Save Result
async function spSaveGameResult(userId, correctAnswers, durationSeconds, levelId) {
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
