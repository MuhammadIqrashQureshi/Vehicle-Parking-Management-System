/*const mysql = require("mysql2");*/
/*
const mysql = require('mysql2/promise');

// Create a connection to the database
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mostwanted3z",
    database: "SE_Project"
});

// Use an async function to connect to the database
async function connectDatabase() {
    try {
        await db; // Wait for the connection to be established
        console.log("Connected to MySQL database!");
    } catch (err) {
        console.error("Database connection failed:", err);
    }
}

connectDatabase();
*/
const mysql = require('mysql2/promise');

// Create a pool to manage multiple connections
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'mostwanted3z',
    database: 'SE_Project'
});

module.exports = pool;
