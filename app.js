const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const MyRepository = require("./myRepository");
const authenticateToken = require("./authMiddleware");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000; // Railway משתמש בדרך כלל בפורט 3000 או משתנה PORT

// Middlewares
app.use(express.json());
app.use(express.static("public"));

// --- [POST] SIGNUP ---
app.post("/signUp", async (req, res) => {
  const { fullName, email, password, age, country } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await MyRepository.spAddNewUser(
      fullName,
      email,
      hashedPassword,
      age,
      country,
    );

    const newUser = await MyRepository.spGetUserByEmail(email);

    const token = jwt.sign(
      { id: newUser.id || newUser.Id, email: email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.status(201).json({
      message: "User registered successfully",
      token: token,
      user: { fullName, email, age, country },
    });
  } catch (error) {
    // שינוי קוד השגיאה מ-2627 ל-1062 (הקוד של MySQL ל-Duplicate Entry)
    if (error.errno === 1062 || error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error("Signup error:", error);
    res.status(500).json({ message: "Error registering user" });
  }
});

// --- [POST] SIGNIN ---
app.post("/signIn", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await MyRepository.spGetUserByEmail(email);

    // MySQL מחזיר שמות עמודות באותיות קטנות בדרך כלל
    const dbPassword = user ? user.password || user.Password : null;

    if (!user || !(await bcrypt.compare(password, dbPassword))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id || user.Id, email: user.email || user.Email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    res.json({
      token: token,
      user: {
        fullName: user.full_name || user.full_name || user.FullName,
        email: user.email || user.Email,
        age: user.age || user.Age,
        country: user.country || user.Country,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Error signing in" });
  }
});

// --- [PUT] UPDATE PROFILE ---
app.put("/updateProfile", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { fullName, email, password, age, country } = req.body;

  try {
    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    await MyRepository.spUpdateUser(
      userId,
      fullName,
      hashedPassword,
      age,
      country,
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// --- [DELETE] ACCOUNT ---
app.delete("/deleteAccount", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const userEmail = req.user.email;
  const { password } = req.body;

  try {
    const user = await MyRepository.spGetUserByEmail(userEmail);
    if (!user) return res.status(404).json({ message: "User not found" });

    const dbPassword = user.password || user.Password;
    const isMatch = await bcrypt.compare(password, dbPassword);

    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password." });
    }

    await MyRepository.spDeleteUser(userId);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Deletion error:", err);
    res.status(500).json({ message: "Server Error during deletion" });
  }
});

// --- [GET] SCORES ---
app.get("/api/scores", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { levelId, startDate, endDate } = req.query;

    if (!levelId) {
      return res.status(400).json({ message: "Missing levelId parameter" });
    }

    const scores = await MyRepository.spGetPlayerScores(
      userId,
      levelId,
      startDate,
      endDate,
    );

    res.json(scores);
  } catch (err) {
    console.error("Error fetching scores:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// --- [POST] SAVE GAME RESULT ---
app.post("/api/saveScore", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { correctAnswers, durationSeconds, levelId } = req.body;

    if (correctAnswers === undefined || !durationSeconds || !levelId) {
      return res.status(400).json({ message: "Missing required game data" });
    }

    await MyRepository.spSaveGameResult(
      userId,
      correctAnswers,
      durationSeconds,
      levelId,
    );

    res.status(201).json({ message: "Game result saved successfully!" });
  } catch (err) {
    console.error("Error saving game result:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
