const sequelize = require("./db");
const defineAssociations = require("./associations");

// Import models
const User = require("./models/User");
const Group = require("./models/Group");
const Message = require("./models/Message");
const UserGroup = require("./models/UserGroup");

// Set up associations
defineAssociations();

// Export Sequelize instance and models
module.exports = {
    sequelize,
    User,
    Group,
    Message,
    UserGroup
};
