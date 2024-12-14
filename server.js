const express = require("express");
const { createConnection } = require("mysql2");
const { hash, compare } = require("bcryptjs");
const cors = require("cors");
const { urlencoded, json } = require("body-parser");
const path = require("path");
require('dotenv').config();

const app = express();
const port = 4000;

app.use(
  cors({
    origin: "http://127.0.0.1:5500", // Update with your frontend's origin
    methods: ["GET", "POST"],
  })
);
app.use(urlencoded({ extended: true }));
app.use(json());
app.use(express.static(path.join(__dirname, "public")));

// Database connection
const db = createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME, 
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  }
  console.log("Connected to the database!");
});

// Route to handle registration with password hashing
app.post("/register", async (req, res) => {
  const { username, email, phonenumber, password } = req.body;

  const errors = {};
  if (!username) errors.username = "Username Required";
  if (!email) errors.email = "Email Required";
  if (!phonenumber) errors.phonenumber = "Phone Number Required";
  if (!password) errors.password = "Password Required";

  if (Object.keys(errors).length > 0) {
    return res.json({ success: false, errors });
  }

  const checkQuery = "SELECT * FROM users WHERE username = ? OR email = ?";
  db.query(checkQuery, [username, email], async (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }
    const existingUser = results.find(user => user.username === username && user.email === email);
    if(existingUser){
        return res.json({ success: false, errors: { username: "Username and email combination already exists." } });
    }
    if (results.length > 0) {
      const existingUser = results[0];
      if (existingUser.username === username) {
        errors.username = "Username already taken.";
      }
      if (existingUser.email === email) {
        errors.email = "Email already registered.";
      }
      return res.json({ success: false, errors });
    }

    try {
      const hashedPassword = await hash(password, 10); // Hash the password
      const insertQuery = "INSERT INTO users (username, email, phoneNumber, password) VALUES (?, ?, ?, ?)";
      db.query(insertQuery, [username, email, phonenumber, hashedPassword], (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res.status(500).json({ success: false, message: "Error saving data to database." });
        }
        res.json({ success: true, message: "User successfully created!" });
      });
    } catch (error) {
      console.error("Error hashing password:", error);
      res.status(500).json({ success: false, message: "Error processing data." });
    }
  });
});

// Route to handle login with password comparison
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const errors = {};
  if (!username) errors.username = "Username Required";
  if (!password) errors.password = "Password Required";

  if (Object.keys(errors).length > 0) {
    return res.json({ success: false, errors });
  }

  const checkQuery = "SELECT * FROM users WHERE username = ? AND email = ?";
  db.query(checkQuery, [username, email], async (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }

    if (results.length === 0) {
      return res.json({ success: false, errors: { email: "Email does not match the username." } });
    }

    const user = results[0];
    try {
      const isMatch = await compare(password, user.password); // Compare hashed passwords
      if (isMatch) {
        res.json({ success: true, message: "Login successful!" });
      } else {
        res.json({ success: false, errors: { password: "Invalid password." } });
      }
    } catch (error) {
      console.error("Error comparing passwords:", error);
      res.status(500).json({ success: false, message: "Internal error." });
    }
  });
});

// Script to hash plaintext passwords in the database
app.get("/hash-passwords", async (req, res) => {
  db.query("SELECT id, password FROM users", async (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).json({ success: false, message: "Database error." });
    }

    for (const user of results) {
      const { id, password } = user;
      if (password.startsWith("$2")) continue; // Skip already hashed passwords

      try {
        const hashedPassword = await hash(password, 10);
        db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, id], (err) => {
          if (err) {
            console.error(`Error updating password for user ID ${id}:`, err);
          }
        });
      } catch (error) {
        console.error(`Error hashing password for user ID ${id}:`, error);
      }
    }
    res.json({ success: true, message: "All plaintext passwords hashed." });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
