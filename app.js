const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const MyRepository = require("./myRepository");
const authenticateToken = require("./authMiddleware");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(express.json()); // Parses incoming JSON requests
app.use(express.static("public")); // Serves static files from the 'public' folder

// --- [POST] SIGNUP ---
app.post("/signUp", async (req, res) => {
  const { fullName, email, password, age, country } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Execute the stored procedure to save the user
    await MyRepository.spAddNewUser(
      fullName,
      email,
      hashedPassword,
      age,
      country,
    );

    // 2. Fetch the newly created user to get their ID for the token
    const newUser = await MyRepository.spGetUserByEmail(email);

    // 3. Generate a JWT token so the user is logged in immediately
    const token = jwt.sign(
      { id: newUser.id || newUser.Id, email: email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // 4. Return the token and user details to the frontend
    res.status(201).json({
      message: "User registered successfully",
      token: token,
      user: { fullName, email, age, country },
    });
  } catch (error) {
    // 2627 is the SQL error code for Unique Key violation (Email exists)
    if (error.number === 2627) {
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
    const dbPassword = user ? user.password || user.Password : null;

    if (!user || !(await bcrypt.compare(password, dbPassword))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Creating the token with user ID and Email from the DB result
    const token = jwt.sign(
      { id: user.id || user.Id, email: user.email || user.Email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // Sending back token and user metadata for the frontend
    res.json({
      token: token,
      user: {
        fullName: user.full_name || user.FullName,
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
// --- [PUT] UPDATE PROFILE (Protected) ---
app.put("/updateProfile", authenticateToken, async (req, res) => {
  const userId = req.user.id; // Extracted from JWT by middleware
  const { fullName, email, password, age, country } = req.body;

  try {
    let hashedPassword = null;
    if (password && password.trim() !== "") {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // FIXED: Only 5 parameters passed to match SQL procedure
    // We do NOT pass 'email' here because the DB doesn't expect it
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

// --- [GET] SCORES (Protected) ---
app.get("/api/scores", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Destructure levelId AND the new date filters from req.query
    const { levelId, startDate, endDate } = req.query;

    if (!levelId) {
      return res.status(400).json({ message: "Missing levelId parameter" });
    }

    // Now passing all 4 arguments to the repository
    const scores = await MyRepository.spGetPlayerScores(
      userId,
      levelId,
      startDate,
      endDate,
    );

    res.json(scores);
  } catch (err) {
    console.error("Error fetching scores from database:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error: Failed to fetch scores" });
  }
});

// --- [POST] SAVE GAME RESULT (Protected) ---
// This route is called when a user finishes a game session.
app.post("/api/saveScore", authenticateToken, async (req, res) => {
  try {
    // 1. Get the User ID safely from the JWT token (provided by authMiddleware)
    const userId = req.user.id;

    // 2. Extract game data from the request body
    const { correctAnswers, durationSeconds, levelId } = req.body;

    // 3. Basic validation to ensure we have all necessary data
    if (correctAnswers === undefined || !durationSeconds || !levelId) {
      return res.status(400).json({
        message:
          "Missing required game data: correctAnswers, durationSeconds, or levelId",
      });
    }

    // 4. Call the Repository to execute the Stored Procedure 'spSaveGameResult'
    await MyRepository.spSaveGameResult(
      userId,
      correctAnswers,
      durationSeconds,
      levelId,
    );

    // 5. Return success status
    res.status(201).json({ message: "Game result saved successfully!" });
  } catch (err) {
    console.error("Error saving game result:", err);
    res
      .status(500)
      .json({ message: "Internal Server Error: Failed to save score" });
  }
});

app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`),
);
