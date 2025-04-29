const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");


const db = require("./db"); 
const userRoutes = require("./userInsert"); 
const userLogin = require("./userLogin");
const users = require("./users");
const vehicleLogsRoutes = require("./vehicleLogs");


const addSlotRoutes = require("./addslot");
const bookSlotRoutes = require("./bookingslot");
const myBookingsRoutes = require("./mybookings");
const changePasswordRoute = require("./changepassword");
const deleteSlotRoute = require("./deleteslot");
const dashboardStatsRoute = require("./dashboardstats");

const settingsRoutes = require("./adminsetting");
const ReviewFeedback = require("./feedback");


const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/user", userRoutes);  
app.use("/api", userLogin);
app.use("/api",users);
app.use("/api/vehicle", vehicleLogsRoutes);

app.use("/api", addSlotRoutes);
app.use("/api", bookSlotRoutes);
app.use("/api", myBookingsRoutes);

app.use("/api", changePasswordRoute);
app.use("/api", dashboardStatsRoute);
app.use("/api", deleteSlotRoute);
app.use("/api", settingsRoutes);
app.use("/api", ReviewFeedback)

const session = require("express-session");

console.log("Session",session);
app.use(session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));



app.get("/api/check-login", (req, res) => {
    if (req.session.userId) {
        res.json({ loggedIn: true });
    } else {
        res.json({ loggedIn: false });
    }
});

app.get("/api/get-user", (req, res) => {
    if (req.session.userId) {
        res.json({ id: req.session.userId });
    } else {
        res.status(401).json({ message: "Not logged in" });
    }
});



// Logout Route
app.get("/api/logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ message: "Logged out successfully" });
    });
});





const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

