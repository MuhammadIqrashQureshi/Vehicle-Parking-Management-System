const express = require("express");
const router = express.Router();
const db = require("./db"); // Your DB connection module

router.post("/update-settings", async (req, res) => {
    const { adminEmail, sessionTimeout } = req.body;

    if (!adminEmail || !sessionTimeout) {
        return res.status(400).json({ 
            success: false, 
            message: "Admin email and session timeout are required." 
        });
    }

    try {
        await db.execute(
            "UPDATE Admins SET email = ?, session_timeout = ? WHERE id = 2", 
            [adminEmail, sessionTimeout]
        );
        
        res.json({ 
            success: true, 
            message: "Settings updated successfully!" 
        });
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ 
            success: false, 
            message: "Database error." 
        });
    }
});

router.get("/settings", async (req, res) => {
    try {
        const [rows] = await db.execute(
            "SELECT email, session_timeout FROM Admins WHERE id = 2"
        );
        
        if (rows.length > 0) {
            res.json({ 
                adminEmail: rows[0].email,
                sessionTimeout: rows[0].session_timeout 
            });
        } else {
            res.status(404).json({ 
                message: "Admin not found" 
            });
        }
    } catch (error) {
        console.error("Error fetching admin settings:", error);
        res.status(500).json({ 
            message: "Database error." 
        });
    }
});
module.exports = router;
