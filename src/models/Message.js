const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const User = require("./User");

const Message = sequelize.define("Message", {
    content: {
        type: DataTypes.TEXT,
        allowNull: false, // Messages must have content
    },
    type: {
        type: DataTypes.ENUM("group", "direct"),
        allowNull: false, // Defines if it's a group message or direct message
    },
}, {
    indexes: [
        {
            fields: ['groupId'], // For group message lookups
        },
        {
            fields: ['receiverId'], // For private message lookups
        },
        {
            fields: ['senderId'], // For filtering by sender
        },
        {
            fields: ['groupId', 'createdAt'], // Composite index for group messages sorted by time
        },
    ],
});

User.hasMany(Message, { foreignKey: "senderId" });
Message.belongsTo(User, { foreignKey: "senderId" });

module.exports = Message;
