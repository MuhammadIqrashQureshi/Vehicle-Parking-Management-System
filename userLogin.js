
const express = require("express");
const db = require("./db");
const router = express.Router();

router.post("/login", async (req, res) => {
    console.log("Received Login Request");

    if (!req.body || !req.body.email || !req.body.password) {
        console.error("Missing email or password in request body", req.body);
        return res.status(400).json({ success: false, message: "Email and password required" });
    }

 
    const { email, password } = req.body;
    console.log("Login attempt:", email);

    try {
        // First, check in Users table
        const userQuery = "SELECT * FROM Users WHERE email = ?";
        const [userResults] = await db.execute(userQuery, [email]);

        if (userResults.length > 0) {
            const user = userResults[0];

            if (user.password !== password) {
                console.log("Incorrect password for:", email);
                return res.status(401).json({ success: false, message: "Incorrect password" });
            }

            console.log("User login successful for:", email);
            return res.json({ success: true, message: "Login successful", user: { id: user.id, email: user.email, role: "user" } });
        }

        // If not found in Users, check in Admins
        const adminQuery = "SELECT * FROM Admins WHERE email = ?";
        const [adminResults] = await db.execute(adminQuery, [email]);

        if (adminResults.length > 0) {
            const admin = adminResults[0];

            if (admin.password !== password) {
                console.log("Incorrect password for:", email);
                return res.status(401).json({ success: false, message: "Incorrect password" });
            }

            console.log("Admin login successful for:", email);
            return res.json({ success: true, message: "Login successful", user: { id: admin.id, email: admin.email, role: "admin" } });
        }

        // If neither User nor Admin is found
        console.log("Invalid login attempt for email:", email);
        return res.status(401).json({ success: false, message: "Invalid email or password" });

    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;