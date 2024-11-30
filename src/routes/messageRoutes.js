const express = require("express");
const {
    getMessages,
    sendMessage,
    getGroupMessages,
} = require("../controllers/messageController");
const authenticate = require("../middleware/authenticate");

const router = express.Router();

// Route to fetch messages with a specific user or group
router.get("/:userId", authenticate, getMessages);

// Route to send a message to a specific user or group
router.post("/", authenticate, sendMessage);

// Route to fetch messages for a specific group
router.get("/group/:groupId", authenticate, getGroupMessages);

module.exports = router;
