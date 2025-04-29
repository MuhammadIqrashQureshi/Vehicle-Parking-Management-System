const express = require("express");
const router = express.Router();
const db = require("./db");

router.post("/book-slot", async (req, res) => {
    const { email, slotId } = req.body;

    if (!email || !slotId || isNaN(slotId)) {
        return res.status(400).json({ message: "Invalid Email or Slot ID" });
    }

    try {
        // Check if the user exists
        const [userResults] = await db.execute("SELECT id FROM Users WHERE email = ?", [email]);

        if (userResults.length === 0) {
            return res.status(400).json({ message: "User not found!" });
        }

        const userId = userResults[0].id;

        // Check if the slot exists and its availability
        const [slotResults] = await db.execute("SELECT status FROM Slots WHERE id = ?", [slotId]);

        if (slotResults.length === 0) {
            return res.status(404).json({ message: "Slot not found" });
        }

        if (slotResults[0].status === "booked") {
            return res.status(400).json({ message: "Slot already booked!" });
        }

        // Insert booking into the database
        await db.execute("INSERT INTO Bookings (user_id, slot_id) VALUES (?, ?)", [userId, slotId]);

        // Update the slot status to 'booked'
        await db.execute("UPDATE Slots SET status = 'booked' WHERE id = ?", [slotId]);

        res.json({ message: "Slot booked successfully!" });
    } catch (error) {
        console.error("Error during slot booking:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
