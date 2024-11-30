require('dotenv').config();
const express = require("express");
const https = require("https");
const fs = require("fs");
const { Server } = require("socket.io");
const { sequelize } = require("./src");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const messageRoutes = require("./src/routes/messageRoutes");
const groupRoutes = require("./src/routes/groupRoutes");

const options = {
    key: fs.readFileSync("../mykey.pem"),
    cert: fs.readFileSync("../mycert.pem"),
};

const app = express();
const server = https.createServer(options, app);
const io = new Server(server);

const PORT = 3001;

// Middleware
app.use(express.json());

// Serve static files
app.use(express.static("public"));

// Routes
app.use("/api/auth", authRoutes); // Use authentication routes

// Add user routes
app.use("/api/users", userRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/groups", groupRoutes);

// Sync database and start server
sequelize
    .sync({ alter: true }) 
    .then(() => {
        console.log("Database synced successfully!");
        server.listen(PORT, () => {
            console.log(`Server running on https://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error syncing database:", err);
    });

// Socket.IO logic
io.on("connection", (socket) => {
    console.log("User connected");
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});
