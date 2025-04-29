const express = require("express");
const db = require("./db");
const router = express.Router();

router.post("/book-slot", (req, res) => 
{
    const { userId, slotId } = req.body;

    if (!userId || !slotId) 
    {
        return res.status(400).json({ message: "User ID and Slot ID are required!" });
    }

    const checkSlotSql = "SELECT * FROM Slots WHERE id = ? AND status = 'available'";
    db.query(checkSlotSql, [slotId], (err, slotResult) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        if (slotResult.length === 0) {
            return res.status(400).json({ message: "Slot not available or does not exist!" });
        }

        const bookSlotSql = "INSERT INTO Bookings (user_id, slot_id) VALUES (?, ?)";
        db.query(bookSlotSql, [userId, slotId], (err, bookingResult) => {
            if (err) {
                console.error("Error booking slot:", err);
                return res.status(500).json({ message: "Database error" });
            }

            const updateSlotSql = "UPDATE Slots SET status = 'booked' WHERE id = ?";
            db.query(updateSlotSql, [slotId], (err, updateResult) => {
                if (err) {
                    console.error("Error updating slot status:", err);
                    return res.status(500).json({ message: "Database error" });
                }

                res.json({ message: "Slot booked successfully!" });
            });
        });
    });
});

router.get("/available-slots", (req, res) => {
    const sql = "SELECT * FROM Slots WHERE status = 'available'";
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
});

router.get("/api/slots", (req, res) => {
    db.query("SELECT id, slot_time FROM Slots WHERE status = 'available'", (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Database error" });
        }
        res.json(results);
    });
});


module.exports = router;
