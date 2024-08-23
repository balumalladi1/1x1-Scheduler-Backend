const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mySqlpool = require("./db");
const userRegisterRoute = require("./routes/userRoute");

// Config
dotenv.config();

// Create Express app
const app = express();
app.use(express.json());
app.use(cors());

// PORT
const PORT = process.env.PORT || 8000;

// MySQL connection and server start
mySqlpool.query("SELECT 1").then(() => {
    console.log("MySQL DB is Connected");
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch((error) => {
    console.log(error);
});

// Test route
app.get("/test", (req, res) => {
    res.status(200).send("<h1>Hi</h1>");
});

// Register route
app.use("/api/v1", userRegisterRoute);
