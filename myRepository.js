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

    return results.map((row) => {
      const correct = row.correct_answers;
      const duration = row.duration_seconds;
      const totalQuestions = 30; // לפי ההוראות
      const wrongAnswers = totalQuestions - correct;

      // --- חישוב הציון לפי חוקי המשחק ---
      let finalScore = 100; // מתחילים מציון מושלם

      // 1. קנס על תשובות שגויות: -3 נקודות לכל טעות
      finalScore -= wrongAnswers * 3;

      // 2. קנס על זמן: מעל 5 דקות (300 שניות), -1 נקודה לכל 10 שניות
      if (duration > 300) {
        const extraTime = duration - 300;
        const timePenalty = Math.floor(extraTime / 10);
        finalScore -= timePenalty;
      }

      // מוודאים שהציון לא יורד מתחת ל-0
      finalScore = Math.max(0, finalScore);

      return {
        DATE: new Date(row.played_at).toLocaleDateString("en-GB"),
        DURATION: duration,
        SUCCESS_RATE: Math.round((correct / totalQuestions) * 100),
        SCORE: finalScore, // זה הציון שיקבע את גובה הנקודה בגרף
      };
    });
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
