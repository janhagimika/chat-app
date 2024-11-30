// messageController.js
const { Message, User} = require("../index");
const { Op } = require("sequelize");

// Fetch messages for a specific user (private chat)
exports.getMessages = async (req, res) => {
    const { userId } = req.params;
    const { id: senderId } = req.user;

    if (!userId) {
        return res.status(400).json({ error: "Receiver ID (userId) is required" });
    }

    try {
        const messages = await Message.findAll({
            where: {
                [Op.or]: [
                    { senderId, receiverId: userId },
                    { senderId: userId, receiverId: senderId },
                ],
            },
            include: [{ model: User, attributes: ["username"] }],
            order: [["createdAt", "ASC"]],
        });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching private messages:", error);
        res.status(500).json({ error: "Failed to fetch private messages" });
    }
};


exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id; // Authenticated user
        const { receiverId, groupId, content, type } = req.body; // Message data

        // Validate required fields
        if (!content || (!receiverId && !groupId)) {
            return res.status(400).json({ message: "Content and receiver/group are required" });
        }

        // Create the message
        const message = await Message.create({
            content,
            type: groupId ? "group" : "direct", // Determine type
            senderId,
            receiverId: groupId ? null : receiverId, // Null for group messages
            groupId: groupId || null, // Null for direct messages
        });

        res.status(201).json(message);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getGroupMessages = async (req, res) => {
    const { groupId } = req.params;
    try {
        const messages = await Message.findAll({
            where: { groupId },
            include: [{ model: User, attributes: ["username"] }],
            order: [["createdAt", "ASC"]],
        });
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching group messages:", error);
        res.status(500).json({ error: "Failed to fetch group messages" });
    }
};


