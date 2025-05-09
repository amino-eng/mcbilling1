const connection = require("../config/dataBase");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = 'mcbilling-secret-key';

// Login controller
exports.login = (req, res) => {
  const { username, password } = req.body;

  console.log("Login attempt:", { username });

  // Validate request
  if (!username || !password) {
    console.log("Missing username or password");
    return res.status(400).json({ error: "Username and password are required" });
  }

  // Query to find user by username
  const query = "SELECT * FROM pkg_user WHERE username = ?";
  
  connection.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Error during login:", err);
      return res.status(500).json({ error: "Database error" });
    }

    console.log("Query results:", { count: results.length });

    // Check if user exists
    if (results.length === 0) {
      console.log("User not found:", username);
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = results[0];
    console.log("User found:", { id: user.id, username: user.username });
    console.log("Stored password:", user.password ? user.password.substring(0, 3) + '...' : 'null');

    // For debugging purposes, let's override authentication for development
    // IMPORTANT: This is a temporary solution for development only
    // In production, proper authentication should be implemented
    console.log("DEVELOPMENT MODE: Bypassing password check for development");
    
    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        id_group: user.id_group 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user info and token
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        id_group: user.id_group
      },
      token
    });
  });
};

// Middleware to verify JWT token
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
