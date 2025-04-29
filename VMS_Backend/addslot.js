const express = require("express");
const router = express.Router();
const db = require("./db");
const mysql = require('mysql2'); // Ensure mysql2 is properly required

// Helper function for executing queries using promises
const queryPromise = (query, params) => {
    return db.execute(query, params)
        .then(([results]) => results)
        .catch((err) => {
            throw err;
        });
};

// Route to add a slot
router.post("/addSlot", async (req, res) => {
    const { slot_time } = req.body;

    if (!slot_time) {
        return res.status(400).json({ success: false, message: "Slot time is required" });
    }

    const query = "INSERT INTO Slots (slot_time, status) VALUES (?, 'available')";

    try {
        const result = await queryPromise(query, [slot_time]);
        res.json({ success: true, message: "Slot added successfully", slotId: result.insertId });
    } catch (err) {
        console.error("Error adding slot:", err);
        return res.status(500).json({ success: false, message: "Database error" });
    }
});
/*
router.get("/slots", async (req, res) => {
    const page = parseInt(req.query.page) || 1; 
    const size = parseInt(req.query.size) || 5; 
    
    const offset = (page - 1) * size;

    try {
        // First, get the total number of available slots
        const [countResult] = await db.execute("SELECT COUNT(*) AS count FROM Slots WHERE status = 'available'");

        const totalSlots = countResult[0].count;
        console.log("total slots: ", totalSlots);

        const totalPages = Math.ceil(totalSlots / size);
        console.log("size:", size);
        console.log("offset:", offset);

        // Format the query with actual values for LIMIT and OFFSET
        const query = mysql.format("SELECT id, slot_time FROM Slots WHERE status = 'available' LIMIT ? OFFSET ?", [size, offset]);

        console.log("Formatted query: ", query); // For debugging

        // Execute the formatted query
        const [results] = await db.execute(query);

        res.json({
            slots: results,
            totalPages: totalPages,
            currentPage: page
        });
    } catch (err) {
        console.error("Error fetching slots:", err);
        res.status(500).json({ message: "Database error" });
    }
});
*/
router.get("/slots", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 5;
    const offset = (page - 1) * size;

    try {
        // Get total count of all slots
        const [countResult] = await db.execute("SELECT COUNT(*) AS count FROM Slots");
        const totalSlots = countResult[0].count;
        const totalPages = Math.ceil(totalSlots / size);

        // Get paginated slots with status
        const query = mysql.format(`
            SELECT id, slot_time, status 
            FROM Slots 
            ORDER BY id 
            LIMIT ? OFFSET ?
        `, [size, offset]);

        const [results] = await db.execute(query);

        res.json({
            slots: results,
            totalPages: totalPages,
            currentPage: page
        });
    } catch (err) {
        console.error("Error fetching slots:", err);
        res.status(500).json({ message: "Database error" });
    }
});

// Route to get available slots
router.get("/my-slots", async (req, res) => {
    const query = "SELECT id, slot_time FROM Slots WHERE status = 'available'";

    try {
        const results = await queryPromise(query);
        if (results.length === 0) {
            return res.status(404).json({ message: "No slots available" });
        }
        res.json(results);
    } catch (err) {
        console.error("Error fetching slots:", err);
        return res.status(500).json({ message: "Database error" });
    }
});

module.exports = router;
