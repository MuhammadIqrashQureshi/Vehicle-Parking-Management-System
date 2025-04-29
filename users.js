const express = require("express");
const db = require("./db");
const router = express.Router();

router.get("/users", async (req, res) => {
    const sql = "SELECT id, username AS name, email FROM Users";

    try {
        // Use await to execute the query and get results
        const [results] = await db.execute(sql);

        // Send the results back as JSON
        res.json(results);
    } catch (err) {
        // If there's an error, log it and send a response
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
    }
});

module.exports = router;
