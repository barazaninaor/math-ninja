const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const MyRepository = require("./myRepository");
const authenticateToken = require("./authMiddleware");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// SIGNUP
app.post("/signUp", async (req, res) => {
  const { fullName, email, password, age, country } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await MyRepository.spAddNewUser(fullName, email, hashedPassword, age, country);
    const newUser = await MyRepository.spGetUserByEmail(email);
    const token = jwt.sign({ id: newUser.id || newUser.Id, email: email }, process.env.JWT_SECRET, { expiresIn: "365d" });
    res.status(201).json({ message: "User registered successfully", token, user: { fullName, email, age, country } });
  } catch (error) {
    if (error.errno === 1062 || error.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Email already exists" });
    res.status(500).json({ message: "Error registering user" });
  }
});

// SIGNIN - מתוקן למניעת קריסת bcrypt
app.post("/signIn", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await MyRepository.spGetUserByEmail(email);
    const dbPassword = user ? (user.password || user.Password) : null;

    if (!user || !dbPassword || !(await bcrypt.compare(password, dbPassword))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id || user.Id, email: user.email || user.Email }, process.env.JWT_SECRET, { expiresIn: "365d" });
    res.json({ token, user: { fullName: user.full_name || user.FullName, email: user.email || user.Email, age: user.age || user.Age, country: user.country || user.Country } });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Error signing in" });
  }
});

// UPDATE PROFILE - מתוקן למניעת שגיאת NULL
app.put("/updateProfile", authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.Id;
  const { fullName, email, password, age, country } = req.body;
  try {
    const user = await MyRepository.spGetUserByEmail(req.user.email);
    let passwordToSave = user.password || user.Password;
    if (password && password.trim() !== "") passwordToSave = await bcrypt.hash(password, 10);

    await MyRepository.spUpdateUser(userId, fullName, passwordToSave, age, country);
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// DELETE ACCOUNT
app.delete("/deleteAccount", authenticateToken, async (req, res) => {
  const userId = req.user.id || req.user.Id;
  const { password } = req.body;
  try {
    const user = await MyRepository.spGetUserByEmail(req.user.email);
    if (!user || !(await bcrypt.compare(password, user.password || user.Password))) {
      return res.status(401).json({ message: "Incorrect password." });
    }
    await MyRepository.spDeleteUser(userId);
    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error during deletion" });
  }
});

// SCORES & SAVE (ללא שינוי)
app.get("/api/scores", authenticateToken, async (req, res) => {
  try {
    const scores = await MyRepository.spGetPlayerScores(req.user.id || req.user.Id, req.query.levelId, req.query.startDate, req.query.endDate);
    res.json(scores);
  } catch (err) { res.status(500).json({ message: "Error fetching scores" }); }
});

app.post("/api/saveScore", authenticateToken, async (req, res) => {
  try {
    const { correctAnswers, durationSeconds, levelId } = req.body;
    await MyRepository.spSaveGameResult(req.user.id || req.user.Id, correctAnswers, durationSeconds, levelId);
    res.status(201).json({ message: "Saved!" });
  } catch (err) { res.status(500).json({ message: "Error saving score" }); }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
