const express = require('express');
const router = express.Router();
const db = require('./db');

router.delete('/delete-slot/:slotId', async (req, res) => {
    const slotId = req.params.slotId;

    console.log(`Attempting to delete slot with ID: ${slotId}`);

    try {
        // First, remove any bookings associated with the slot
        await db.execute('DELETE FROM bookings WHERE slot_id = ?', [slotId]);

        // Now delete the slot itself
        const [result] = await db.execute('DELETE FROM slots WHERE id = ?', [slotId]);

        console.log(result);

        // If no rows were affected, it means the slot was not found
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Slot not found" });
        }

        // Success: slot deleted
        res.json({ message: "Slot deleted successfully" });
    } catch (error) {
        console.error("Delete Slot Error:", error);
        // Return a 500 Internal Server Error if something goes wrong
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
