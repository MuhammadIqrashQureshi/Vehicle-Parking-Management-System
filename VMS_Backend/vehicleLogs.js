const express = require("express");
const router = express.Router();
const db = require("./db");

// Vehicle Check-in with enhanced validation
router.post("/checkin", async (req, res) => {
    const { user_email, vehicle_number } = req.body;

    // Validate inputs
    if (!user_email || !vehicle_number) {
        return res.status(400).json({ 
            success: false,
            message: "User email and vehicle number are required" 
        });
    }

    // Validate vehicle number format (ABC-1234)
    const vehicleRegex = /^[A-Za-z]{3}-\d{3,4}$/;
    if (!vehicleRegex.test(vehicle_number)) {
        return res.status(400).json({ 
            success: false,
            message: "Invalid vehicle number format. Please use format ABC-123" 
        });
    }

    try {
        // Get User ID
        const [userResults] = await db.execute(
            "SELECT id FROM Users WHERE email = ?", 
            [user_email]
        );

        if (userResults.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "User not found" 
            });
        }

        const userId = userResults[0].id;

        // Check if user already has a vehicle checked in
        const [userCheckinResults] = await db.execute(
            `SELECT * FROM VehicleLogs 
             WHERE user_id = ? AND check_out_time IS NULL`,
            [userId]
        );

        if (userCheckinResults.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: "You already have a vehicle checked in" 
            });
        }

        // Check if vehicle is already checked in
        const [vehicleResults] = await db.execute(
            `SELECT * FROM VehicleLogs 
             WHERE vehicle_number = ? AND check_out_time IS NULL`,
            [vehicle_number]
        );

        if (vehicleResults.length > 0) {
            return res.status(400).json({ 
                success: false,
                message: "This vehicle is already checked in" 
            });
        }

        // Check for valid booking
        const [bookingResults] = await db.execute(
            `SELECT b.id, b.slot_id 
             FROM Bookings b
             JOIN Slots s ON b.slot_id = s.id
             WHERE b.user_id = ? 
             AND s.status = 'booked' 
             AND b.booking_time <= NOW() 
             AND TIMESTAMPADD(HOUR, 2, b.booking_time) >= NOW()`,
            [userId]
        );

        if (bookingResults.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "No valid booking found for check-in" 
            });
        }

        // Perform check-in
        await db.execute(
            `INSERT INTO VehicleLogs 
             (user_id, user_email, vehicle_number, check_in_time) 
             VALUES (?, ?, ?, NOW())`,
            [userId, user_email, vehicle_number]
        );

        // Update slot status
        await db.execute(
            "UPDATE Slots SET status = 'used' WHERE id = ?",
            [bookingResults[0].slot_id]
        );

        res.json({ 
            success: true,
            message: "Check-in successful!",
            vehicle_number: vehicle_number
        });

    } catch (err) {
        console.error("Check-in error:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error during check-in" 
        });
    }
});

// Vehicle Check-out with fee calculation
router.post("/checkout", async (req, res) => {
    const { user_email, vehicle_number } = req.body;

    if (!user_email || !vehicle_number) {
        return res.status(400).json({ 
            success: false,
            message: "User email and vehicle number are required" 
        });
    }

    try {
        // Find active check-in
        const [results] = await db.execute(
            `SELECT vl.id, vl.check_in_time, b.slot_id 
             FROM VehicleLogs vl
             JOIN Bookings b ON b.user_id = vl.user_id
             WHERE vl.user_email = ? 
             AND vl.vehicle_number = ? 
             AND vl.check_out_time IS NULL 
             ORDER BY vl.check_in_time DESC LIMIT 1`,
            [user_email, vehicle_number]
        );

        if (results.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "No active check-in found for this vehicle" 
            });
        }

        // Calculate duration and fee
        const checkInTime = new Date(results[0].check_in_time);
        const durationHours = Math.ceil((Date.now() - checkInTime) / (1000 * 60 * 60));
        const feeRate = 100; // Rs. 100 per hour
        const totalFee = durationHours * feeRate;

        // Update check-out
        await db.execute(
            `UPDATE VehicleLogs 
             SET check_out_time = NOW(), total_fee = ? 
             WHERE id = ?`,
            [totalFee, results[0].id]
        );

        // Free up the slot
        await db.execute(
            "UPDATE Slots SET status = 'available' WHERE id = ?",
            [results[0].slot_id]
        );

        res.json({ 
            success: true,
            message: `Check-out successful! Fee: Rs. ${totalFee}`,
            duration: durationHours,
            fee: totalFee
        });

    } catch (err) {
        console.error("Check-out error:", err);
        res.status(500).json({ 
            success: false,
            message: "Server error during check-out" 
        });
    }
});

module.exports = router;
