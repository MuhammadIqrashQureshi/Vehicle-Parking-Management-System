const express = require("express");
const db = require("./db");
const router = express.Router();

router.post("/signup", async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    // Username validation: starts with alphabet, followed by alphanumeric characters
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(username)) {
        return res.status(400).json({ 
            message: "Username must start with a letter and can only contain letters and numbers!" 
        });
    }

    // Email validation: starts with alphabet, contains @ and a domain
    if (!/^[a-zA-Z][a-zA-Z0-9._]*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/.test(email)) {
        return res.status(400).json({ 
            message: "Email must start with a letter, contain @ and a domain (like .com)!" 
        });
    }

    // Password validation
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{7,}/.test(password)) {
        return res.status(400).json({ 
            message: "Password must be at least 7 characters long, include an uppercase letter, a lowercase letter, and a special character!" 
        });
    }

    let checkEmailSql, insertUserSql, checkAdminSql;

    if (role === "user") {
        checkEmailSql = "SELECT * FROM Users WHERE email = ? OR username = ?";
        insertUserSql = "INSERT INTO Users (username, email, password) VALUES (?, ?, ?)";
    } else if (role === "admin") {
        // First check if any admin already exists
        checkAdminSql = "SELECT * FROM Admins LIMIT 1";
        checkEmailSql = "SELECT * FROM Admins WHERE email = ? OR username = ?";
        insertUserSql = "INSERT INTO Admins (username, email, password) VALUES (?, ?, ?)";
    } else {
        return res.status(400).json({ message: "Invalid role!" });
    }

    try {
        // For admin registration, first check if any admin exists
        if (role === "admin") {
            const [existingAdmin] = await db.execute(checkAdminSql);
            if (existingAdmin.length > 0) {
                return res.status(400).json({ 
                    message: "Admin already exists! Only one admin is allowed in the system." 
                });
            }
        }

        // Check if email or username already exists in the database
        const [existingUser] = await db.execute(checkEmailSql, [email, username]);
        
        if (existingUser.length > 0) {
            return res.status(400).json({ 
                message: "Email or username is already registered!" 
            });
        }

        // Insert the new user into the respective table
        await db.execute(insertUserSql, [username, email, password]);

        if (role === "user") {
            res.json({ message: "User registered successfully!" });
        } else {
            res.json({ message: "Admin registered successfully!" });
        }

    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
    }
});
module.exports = router;
