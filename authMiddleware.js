const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticateToken(req, res, next) {
  const authHeader = req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Access denied." });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }
    
    // מוודא שה-ID נשמר בפורמט אחיד (id) כדי שה-Repository לא יקבל NULL
    req.user = {
      ...decodedUser,
      id: decodedUser.id || decodedUser.Id
    };
    
    next();
  });
}

module.exports = authenticateToken;
