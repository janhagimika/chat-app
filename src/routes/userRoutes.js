const express = require("express");
const { getAllUsers } = require("../controllers/userController");

const router = express.Router();

// Route for fetching all users
router.get("/", getAllUsers);

module.exports = router;
