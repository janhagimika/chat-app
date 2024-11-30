const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Group = sequelize.define("Group", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    indexes: [
        {
            fields: ['name'], // For searching groups by name
        },
    ],
});
module.exports = Group;
