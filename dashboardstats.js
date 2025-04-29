const express = require('express');
const router = express.Router();
const db = require('./db'); // adjust if path is different

router.get('/dashboardStats', async (req, res) => {
    try {
        const [users] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
        const [slots] = await db.query('SELECT COUNT(*) AS activeSlots FROM slots');
        const [bookings] = await db.query('SELECT COUNT(*) AS totalBookings FROM bookings');

        const utilization = (bookings[0].totalBookings / (slots[0].activeSlots * 1.0 || 1)) * 100;

        res.json({
            totalUsers: users[0].totalUsers,
            activeSlots: slots[0].activeSlots,
            totalBookings: bookings[0].totalBookings,
            utilization: utilization.toFixed(2) + "%"
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/*
router.get('/my-chartStats', async (req, res) => {
    try {
        const [users] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
        const [slots] = await db.query('SELECT COUNT(*) AS activeSlots FROM slots');
        const [bookings] = await db.query('SELECT COUNT(*) AS totalBookings FROM bookings');

        const utilization = (bookings[0].totalBookings / (slots[0].activeSlots * 1.0 || 1)) * 100;

        const [prevUsers] = await db.query('SELECT COUNT(*) AS prevTotalUsers FROM users WHERE created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)');
        const growthRate = ((users[0].totalUsers - prevUsers[0].prevTotalUsers) / (prevUsers[0].prevTotalUsers || 1)) * 100;

        const completionRate = 100.0;

        res.json({
            totalUsers: users[0].totalUsers,
            activeSlots: slots[0].activeSlots,
            totalBookings: bookings[0].totalBookings,
            utilization: utilization.toFixed(2) + "%",
            growthRate: growthRate.toFixed(2) + "%",
            completionRate: completionRate.toFixed(2) + "%"
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

*/

router.get('/my-chartStats', async (req, res) => {
    try {
        // Get current counts
        const [users] = await db.query('SELECT COUNT(*) AS totalUsers FROM Users');
        const [slots] = await db.query("SELECT COUNT(*) AS activeSlots FROM Slots WHERE status = 'available'");
        const [bookings] = await db.query('SELECT COUNT(*) AS totalBookings FROM Bookings');
        
        // Calculate utilization (max 100%)
        const utilization = Math.min(
            (bookings[0].totalBookings / (slots[0].activeSlots * 1.0 || 1)) * 100,
            100
        ).toFixed(2);

        // Calculate growth rate (more realistic)
        const [prevUsers] = await db.query(`
            SELECT COUNT(*) AS prevTotalUsers 
            FROM Users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) 
            AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);
        
        const [currentUsers] = await db.query(`
            SELECT COUNT(*) AS currentTotalUsers 
            FROM Users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        `);
        
        const growthRate = prevUsers[0].prevTotalUsers > 0 
            ? ((currentUsers[0].currentTotalUsers - prevUsers[0].prevTotalUsers) / 
               prevUsers[0].prevTotalUsers) * 100
            : currentUsers[0].currentTotalUsers > 0 ? 100 : 0;

        // Calculate completion rate (based on completed bookings)
        const [completedBookings] = await db.query(`
            SELECT COUNT(*) AS completed 
            FROM Bookings b
            JOIN Vehiclelogs v ON b.user_id = v.user_id
            WHERE v.check_out_time IS NOT NULL
        `);
        
        const completionRate = bookings[0].totalBookings > 0
            ? (completedBookings[0].completed / bookings[0].totalBookings) * 100
            : 0;

        res.json({
            totalUsers: users[0].totalUsers,
            activeSlots: slots[0].activeSlots,
            totalBookings: bookings[0].totalBookings,
            utilization: utilization + "%",
            growthRate: growthRate.toFixed(2) + "%",
            completionRate: completionRate.toFixed(2) + "%"
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

router.get('/my-users', async (req, res) => {
    try {
        const [users] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
       
        res.json({
            totalUsers: users[0].totalUsers,
        });
    } catch (error) {
        console.error("Users Stats Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
router.get('/user-activity', async (req, res) => {
    const range = req.query.range || "month";
    let query = "";

    switch (range) {
        case "week":
            query = `SELECT DATE(booking_time) as label, COUNT(*) as count 
                     FROM bookings 
                     WHERE booking_time >= NOW() - INTERVAL 7 DAY 
                     GROUP BY DATE(booking_time) ORDER BY DATE(booking_time)`;
            break;
        case "month":
            query = `SELECT DATE(booking_time) as label, COUNT(*) as count 
                     FROM bookings 
                     WHERE booking_time >= NOW() - INTERVAL 1 MONTH 
                     GROUP BY DATE(booking_time) ORDER BY DATE(booking_time)`;
            break;
        case "quarter":
            query = `SELECT DATE(booking_time) as label, COUNT(*) as count 
                     FROM bookings 
                     WHERE booking_time >= NOW() - INTERVAL 3 MONTH 
                     GROUP BY DATE(booking_time) ORDER BY DATE(booking_time)`;
            break;
        case "year":
            query = `SELECT DATE_FORMAT(booking_time, '%Y-%m') as label, COUNT(*) as count 
                     FROM bookings 
                     WHERE booking_time >= NOW() - INTERVAL 1 YEAR 
                     GROUP BY DATE_FORMAT(booking_time, '%Y-%m') ORDER BY label`;
            break;
        default:
            return res.status(400).json({ error: "Invalid range" });
    }

    try {
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error("User activity chart error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;