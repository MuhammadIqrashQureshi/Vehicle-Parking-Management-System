const express = require("express");
const router = express.Router();
const db = require("./db");

router.post("/change-password", async (req, res) => {
    const { email, currentPassword, newPassword } = req.body;

    if (!email || !currentPassword || !newPassword) {
        return res.status(400).json({ message: "Please fill in all fields" });
    }

    try {
        // Check if the user exists and fetch the stored password
        const [userResults] = await db.execute("SELECT password FROM Users WHERE email = ?", [email]);

        if (userResults.length === 0) {
            return res.status(404).json({ message: "User not found!" });
        }

        const storedPassword = userResults[0].password;

        // Check if the current password is correct
        if (storedPassword !== currentPassword) {
            return res.status(403).json({ message: "Current password is incorrect" });
        }

        // Update the password with the new one
        await db.execute("UPDATE Users SET password = ? WHERE email = ?", [newPassword, email]);

        res.json({ message: "Password changed successfully!" });
    } catch (error) {
        console.error("Error during password change:", error);
        res.status(500).json({ message: "Database error" });
    }
});

module.exports = router;
