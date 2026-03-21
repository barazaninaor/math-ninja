const { pool } = require("./db");

// 1. Signup
async function spAddNewUser(full_name, email, hashed_password, age, country) {
  await pool.execute("CALL railway.spAddNewUser(?, ?, ?, ?, ?)", [
    full_name, email, hashed_password, age, country
  ]);
}

// 2. Login - Back to original working version
async function spGetUserByEmail(email) {
  const [rows] = await pool.execute("CALL railway.spGetUserByEmail(?)", [email]);
  return rows[0] ? rows[0][0] : null;
}

// 3. Edit Profile - FIXED: Direct SQL to avoid Railway procedure errors
async function spUpdateUser(theid, full_name, password, age, country) {
  const sql = `UPDATE users SET full_name = ?, password = ?, age = ?, country = ? WHERE id = ?`;
  await pool.execute(sql, [
    full_name || "", 
    password || "", 
    age || 0, 
    country || "", 
    theid
  ]);
}

// 4. Delete - Direct SQL (Fixed & Stable)
async function spDeleteUser(theid) {
  await pool.execute("DELETE FROM users WHERE id = ?", [theid]);
}

// 5. Scores & Results (Keep your original logic)
async function spGetPlayerScores(userId, levelId, startDate, endDate) {
  const [rows] = await pool.execute("CALL railway.spGetPlayerScores(?, ?, ?, ?)", 
    [userId, levelId, startDate || null, endDate || null]);
  const results = rows[0] || [];
  return results.map((row) => {
    const correct = row.correct_answers;
    const duration = row.duration_seconds;
    let finalScore = 100 - ((30 - correct) * 3);
    if (duration > 300) finalScore -= Math.floor((duration - 300) / 10);
    return {
      DATE: new Date(row.played_at).toLocaleDateString("en-GB"),
      DURATION: duration,
      SUCCESS_RATE: Math.round((correct / 30) * 100),
      SCORE: Math.max(0, finalScore),
    };
  });
}

async function spSaveGameResult(userId, correctAnswers, durationSeconds, levelId) {
  await pool.execute("CALL railway.spSaveGameResult(?, ?, ?, ?)", 
    [userId, correctAnswers, durationSeconds, levelId]);
}

module.exports = { spAddNewUser, spUpdateUser, spGetUserByEmail, spDeleteUser, spGetPlayerScores, spSaveGameResult };
