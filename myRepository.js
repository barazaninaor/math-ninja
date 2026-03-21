const { pool } = require("./db"); // אנחנו משתמשים ב-pool שייצאנו קודם

// Signup logic
async function spAddNewUser(full_name, email, hashed_password, age, country) {
  // ב-MySQL משתמשים ב-query או execute עם סימני שאלה לפי סדר הפרמטרים
  await pool.execute("CALL spAddNewUser(?, ?, ?, ?, ?)", [
    full_name,
    email,
    hashed_password,
    age,
    country,
  ]);
}

// Edit Profile logic
async function spUpdateUser(theid, full_name, password, age, country) {
  await pool.execute("CALL spUpdateUser(?, ?, ?, ?, ?)", [
    theid,
    full_name,
    password,
    age,
    country,
  ]);
}

// Helper to get user by email
async function spGetUserByEmail(email) {
  // MySQL מחזיר מערך של תוצאות. התוצאה הראשונה היא רשימת השורות.
  const [rows] = await pool.execute("CALL spGetUserByEmail(?)", [email]);
  // בפרוצדורות, MySQL מחזיר מערך בתוך מערך, לכן ניגש ל-[0][0]
  return rows[0] ? rows[0][0] : null;
}

// Account Deletion
async function spDeleteUser(theid) {
  await pool.execute("DELETE FROM Users WHERE id = ?", [theid]);
}

// Function to get player scores
async function spGetPlayerScores(userId, levelId, startDate, endDate) {
  try {
    const [rows] = await pool.execute("CALL spGetPlayerScores(?, ?, ?, ?)", [
      userId,
      levelId,
      startDate || null,
      endDate || null,
    ]);
    return rows[0]; // מחזיר את רשימת התוצאות מהפרוצדורה
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
  await pool.execute("CALL spSaveGameResult(?, ?, ?, ?)", [
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
