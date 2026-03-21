const { pool } = require("./db");

// 1. Signup - Back to your original logic
async function spAddNewUser(full_name, email, hashed_password, age, country) {
  await pool.execute("CALL railway.spAddNewUser(?, ?, ?, ?, ?)", [
    full_name,
    email,
    hashed_password,
    age,
    country,
  ]);
}

// 2. Edit Profile - FIXED: Using direct query to avoid Railway errors
async function spUpdateUser(theid, full_name, password, age, country) {
  // Using direct SQL because Railway's Procedure creation is failing
  const sql = `UPDATE users SET full_name = ?, password = ?, age = ?, country = ? WHERE id = ?`;
  await pool.execute(sql, [
    full_name || "", 
    password || "", 
    age || 0, 
    country || "", 
    theid
  ]);
}

// 3. Login - Back to your original nested array structure
async function spGetUserByEmail(email) {
  try {
    const [rows] = await pool.execute("CALL railway.spGetUserByEmail(?)", [email]);
    
    if (!rows || rows.length === 0) return null;

    // Check if user is in rows[0][0] (standard for procedures) or directly in rows[0]
    let user = null;
    if (Array.isArray(rows[0])) {
      user = rows[0][0];
    } else {
      user = rows[0];
    }

    // Safety: only return if it's a valid object and has the password field
    if (user && (user.password || user.PASSWORD)) {
      return user;
    }

    return null;
  } catch (err) {
    console.error("Critical Login Error:", err);
    throw err;
  }
}

// 4. Account Deletion - Simple and direct
async function spDeleteUser(theid) {
  await pool.execute("DELETE FROM users WHERE id = ?", [theid]);
}

// 5. Player Scores - Your original code exactly as it was
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
      const wrongAnswers = totalQuestions - correct;

      let finalScore = 100;
      finalScore -= wrongAnswers * 3;
      if (duration > 300) {
        finalScore -= Math.floor((duration - 300) / 10);
      }
      finalScore = Math.max(0, finalScore);

      return {
        DATE: new Date(row.played_at).toLocaleDateString("en-GB"),
        DURATION: duration,
        SUCCESS_RATE: Math.round((correct / totalQuestions) * 100),
        SCORE: finalScore,
      };
    });
  } catch (err) {
    console.error("Database Error:", err);
    throw err;
  }
}

// 6. Save Game Result
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
