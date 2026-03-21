const { pool } = require("./db");

/**
 * Signup logic: Adds a new user to the database using a stored procedure
 */
async function spAddNewUser(full_name, email, hashed_password, age, country) {
  await pool.execute("CALL railway.spAddNewUser(?, ?, ?, ?, ?)", [
    full_name,
    email,
    hashed_password,
    age,
    country,
  ]);
}

/**
 * Edit Profile logic: Updates user information.
 * Uses direct SQL to bypass Railway's stored procedure creation issues.
 * Uses default values (|| "") to prevent ER_BAD_NULL_ERROR.
 */
async function spUpdateUser(theid, full_name, password, age, country) {
  const sql = `
    UPDATE users 
    SET full_name = ?, password = ?, age = ?, country = ? 
    WHERE id = ?
  `;

  try {
    // The || operator ensures we send empty strings/0 instead of NULL/undefined
    await pool.execute(sql, [
      full_name || "",
      password || "",
      age || 0,
      country || "",
      theid
    ]);
  } catch (err) {
    console.error("Database Update Error:", err);
    throw err;
  }
}

/**
 * Helper to fetch a user by their email address.
 * Standardizes the result from the MySQL procedure nested array.
 */
async function spGetUserByEmail(email) {
  const [rows] = await pool.execute("CALL railway.spGetUserByEmail(?)", [email]);
  // MySQL procedures return data in rows[0][0]
  return (rows[0] && rows[0][0]) ? rows[0][0] : null;
}

/**
 * Account Deletion: Removes user from the database.
 * Uses direct DELETE for better reliability in cloud environments.
 */
async function spDeleteUser(theid) {
  await pool.execute("DELETE FROM users WHERE id = ?", [theid]);
}

/**
 * Fetch player scores and calculate game performance metrics (Score/Success Rate).
 */
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

      // Scoring Logic
      let finalScore = 100;

      // Penalty 1: -3 points per wrong answer
      finalScore -= wrongAnswers * 3;

      // Penalty 2: Time penalty (-1 point per 10 seconds over 5 minutes)
      if (duration > 300) {
        const extraTime = duration - 300;
        const timePenalty = Math.floor(extraTime / 10);
        finalScore -= timePenalty;
      }

      // Ensure score stays within 0-100 range
      finalScore = Math.max(0, finalScore);

      return {
        DATE: new Date(row.played_at).toLocaleDateString("en-GB"),
        DURATION: duration,
        SUCCESS_RATE: Math.round((correct / totalQuestions) * 100),
        SCORE: finalScore,
      };
    });
  } catch (err) {
    console.error("Database Error in spGetPlayerScores:", err);
    throw err;
  }
}

/**
 * Save game session results using a stored procedure.
 */
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
