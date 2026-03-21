const { pool } = require("./db");

// 1. Signup
async function spAddNewUser(full_name, email, hashed_password, age, country) {
  await pool.execute("CALL railway.spAddNewUser(?, ?, ?, ?, ?)", [
    full_name, email, hashed_password, age, country,
  ]);
}

// 2. Login - חסין לשינויי מבנה ב-Railway
async function spGetUserByEmail(email) {
  const [rows] = await pool.execute("CALL railway.spGetUserByEmail(?)", [email]);
  if (!rows || rows.length === 0) return null;
  // בודק אם המשתמש במערך הפנימי או החיצוני
  const user = (rows[0] && Array.isArray(rows[0])) ? rows[0][0] : rows[0];
  return user || null;
}

// 3. Update - SQL ישיר למניעת שגיאות פרוצדורה
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

// 4. Delete - SQL ישיר
async function spDeleteUser(theid) {
  await pool.execute("DELETE FROM users WHERE id = ?", [theid]);
}

// 5. Scores
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

// 6. Save Result
async function spSaveGameResult(userId, correctAnswers, durationSeconds, levelId) {
  await pool.execute("CALL railway.spSaveGameResult(?, ?, ?, ?)", 
    [userId, correctAnswers, durationSeconds, levelId]);
}

module.exports = { spAddNewUser, spUpdateUser, spGetUserByEmail, spDeleteUser, spGetPlayerScores, spSaveGameResult };
