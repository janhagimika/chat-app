const User = require("./models/User");
const Group = require("./models/Group");
const Message = require("./models/Message");

const defineAssociations = () => {
    // Many-to-Many Relationship: Users <-> Groups
    User.belongsToMany(Group, { through: "UserGroups" });
    Group.belongsToMany(User, { through: "UserGroups" });

    // Messages associations
    Message.belongsTo(User, { as: "sender", foreignKey: "senderId" }); // Sender
    Message.belongsTo(User, { as: "receiver", foreignKey: "receiverId" }); // Receiver
    Message.belongsTo(Group, { foreignKey: "groupId" }); // Group

    // Users and Groups can have many Messages
    User.hasMany(Message, { foreignKey: "senderId" });
    User.hasMany(Message, { foreignKey: "receiverId" });
    Group.hasMany(Message, { foreignKey: "groupId" });
};

module.exports = defineAssociations;
