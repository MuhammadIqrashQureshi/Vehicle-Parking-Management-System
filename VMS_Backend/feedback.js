
const express = require("express");
const router = express.Router();
const db = require("./db");

router.post("/submitFeedback", async (req, res) => {
    const { email, rating, comments } = req.body;
    console.log("Received feedback submission request");

    // Input validation
    if (!email || !rating) {
        console.log("Validation failed - missing email or rating");
        return res.status(400).json({ error: "Missing email or rating" });
    }

    // Validate rating is a number between 1-5
    if (isNaN(rating) || rating < 1 || rating > 5) {
        console.log("Validation failed - invalid rating value");
        return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    try {
        // 1. Find user_id based on email
        console.log("Searching for user with email:", email);
        const [userResults] = await db.execute(
            "SELECT id FROM Users WHERE email = ?", 
            [email]
        );

        if (userResults.length === 0) {
            console.log("User not found with email:", email);
            return res.status(404).json({ error: "User not found" });
        }

        const userId = userResults[0].id;
        console.log("Found user ID:", userId);

        // 2. Insert feedback
        console.log("Inserting feedback into database");
        const [insertResult] = await db.execute(
            `INSERT INTO Feedback (user_id, rating, comments)
             VALUES (?, ?, ?)`,
            [userId, rating, comments || null]
        );

        console.log("Feedback inserted successfully. ID:", insertResult.insertId);
        res.status(200).json({ 
            message: "Feedback submitted successfully!",
            feedbackId: insertResult.insertId
        });

    } catch (error) {
        console.error("Error in feedback submission process:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/getAllFeedback', async (req, res) => {
    try {
        const [results] = await db.execute(`
            SELECT 
                f.feedback_id,
                f.user_id, 
                u.email AS user_email, 
                f.rating, 
                f.comments, 
                f.feedback_date AS created_at
            FROM Feedback f
            JOIN Users u ON f.user_id = u.id
            ORDER BY f.feedback_date DESC
        `);
        
        res.json(results);
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Failed to fetch feedback data' });
    }
});

module.exports = router