const { pool } = require("./db");

// 1. Signup - Original Logic
async function spAddNewUser(full_name, email, hashed_password, age, country) {
  await pool.execute("CALL railway.spAddNewUser(?, ?, ?, ?, ?)", [
    full_name,
    email,
    hashed_password,
    age,
    country,
  ]);
}

// 2. Login - Original Logic (The version that doesn't crash bcrypt)
async function spGetUserByEmail(email) {
  const [rows] = await pool.execute("CALL railway.spGetUserByEmail(?)", [email]);
  // Returns the first record from the first array (Standard for your procedures)
  return rows[0] ? rows[0][0] : null;
}

// 3. Edit Profile - FIXED: Direct SQL to bypass procedure error
async function spUpdateUser(theid, full_name, password, age, country) {
  // Using direct UPDATE because the procedure failed in Railway
  const sql = `UPDATE users SET full_name = ?, password = ?, age = ?, country = ? WHERE id = ?`;
  
  // Using || to prevent ER_BAD_NULL_ERROR
  await pool.execute(sql, [
    full_name || "",
    password || "",
    age || 0,
    country || "",
    theid
  ]);
}

// 4. Delete - Original Logic
async function spDeleteUser(theid) {
  // If the procedure exists, this works. If not, use the direct DELETE version.
  await pool.execute("CALL railway.spDeleteUser(?)", [theid]);
}

// 5. Player Scores - Original Logic
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
      if (duration > 300) {
        finalScore -= Math.floor((duration - 300) / 10);
      }

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

// 6. Save Game Result - Original Logic
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
