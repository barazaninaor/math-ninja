const { pool } = require("./db");

// 1. Signup - Original
async function spAddNewUser(full_name, email, hashed_password, age, country) {
  await pool.execute("CALL railway.spAddNewUser(?, ?, ?, ?, ?)", [
    full_name, email, hashed_password, age, country
  ]);
}

// 2. Login - Returns to the EXACT structure that worked for you
async function spGetUserByEmail(email) {
  const [rows] = await pool.execute("CALL railway.spGetUserByEmail(?)", [email]);
  // Reverting to your original way of accessing data
  return rows[0] ? rows[0][0] : null;
}

// 3. Edit Profile - FIXED: Direct SQL to bypass Railway procedure issues
async function spUpdateUser(theid, full_name, password, age, country) {
  // Direct SQL is the only way to bypass the ERROR 1064 in Railway
  const sql = `UPDATE users SET full_name = ?, password = ?, age = ?, country = ? WHERE id = ?`;
  
  await pool.execute(sql, [
    full_name || "", 
    password || "", 
    age || 0, 
    country || "", 
    theid
  ]);
}

// 4. Delete - Back to your original Call
async function spDeleteUser(theid) {
  await pool.execute("CALL railway.spDeleteUser(?)", [theid]);
}

// 5. Scores - Your original working logic
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
      let finalScore = 100 - ((30 - correct) * 3);
      if (duration > 300) finalScore -= Math.floor((duration - 300) / 10);
      
      return {
        DATE: new Date(row.played_at).toLocaleDateString("en-GB"),
        DURATION: duration,
        SUCCESS_RATE: Math.round((correct / 30) * 100),
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
  await pool.execute("CALL railway.spSaveGameResult(?, ?, ?, ?)", 
    [userId, correctAnswers, durationSeconds, levelId]);
}

module.exports = {
  spAddNewUser,
  spUpdateUser,
  spGetUserByEmail,
  spDeleteUser,
  spGetPlayerScores,
  spSaveGameResult,
};
