const { Sequelize } = require("sequelize");

// Configure Sequelize for PostgreSQL
const sequelize = new Sequelize("chat_db", "postgres", "4848", {
    host: "localhost",
    dialect: "postgres",
    logging: false, // Set true if you want SQL logs in the console
});

// Test the database connection
sequelize.authenticate()
    .then(() => console.log("PostgreSQL connected!"))
    .catch((err) => console.log("Error: " + err));

module.exports = sequelize;
