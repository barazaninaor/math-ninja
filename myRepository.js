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
// 5. Get Player Scores with formatting
async function spGetPlayerScores(userId, levelId, startDate, endDate) {
  // Execute the stored procedure on Railway MySQL
  const [rows] = await pool.execute(
    "CALL railway.spGetPlayerScores(?, ?, ?, ?)",
    [userId, levelId, startDate || null, endDate || null],
  );

  // Extract the first element of the result array (the actual data rows)
  const results = rows[0] || [];

  // Map the raw database rows to a formatted object for the Frontend
  return results.map((row) => {
    const correct = row.correct_answers;
    const duration = row.duration_seconds;

    // Convert total seconds into MM:SS format (e.g., 380s -> 6:20)
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    // padStart ensures we always have two digits for seconds (e.g., 6:05 instead of 6:5)
    const durationDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Calculate the final score based on correct answers and time penalties
    let finalScore = 100 - (30 - correct) * 3;
    
    // Apply penalty for duration exceeding 300 seconds (5 minutes)
    if (duration > 300) {
      finalScore -= Math.floor((duration - 300) / 10);
    }

    return {
      DATE: new Date(row.played_at).toLocaleDateString("en-GB"), // Format: DD/MM/YYYY
      DURATION: durationDisplay, // Now returns "MM:SS" string
      SUCCESS_RATE: Math.round((correct / 30) * 100), // Pure number (percentage)
      SCORE: Math.max(0, finalScore), // Ensure score doesn't go below zero
    };
  });
}

// 6. Save Result
async function spSaveGameResult(userId, correctAnswers, durationSeconds, levelId) {
  await pool.execute("CALL railway.spSaveGameResult(?, ?, ?, ?)", 
    [userId, correctAnswers, durationSeconds, levelId]);
}

module.exports = { spAddNewUser, spUpdateUser, spGetUserByEmail, spDeleteUser, spGetPlayerScores, spSaveGameResult };
