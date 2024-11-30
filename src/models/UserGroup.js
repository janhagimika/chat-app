const sequelize = require("../db");
const { DataTypes } = require("sequelize");

const UserGroup = sequelize.define('UserGroup', {
    UserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    GroupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['UserId', 'GroupId'], // Composite index to ensure no duplicate User-Group pairs
      },
      {
        fields: ['GroupId', 'UserId'], // Composite index for fetching members of a group
      },
    ],
  });
  