const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate'); // Add your authentication middleware
const groupController = require('../controllers/groupController');

// Create a group
router.post('/', authenticate, groupController.createGroup);

// Add a user to a group
router.post('/add-user', authenticate, groupController.addUserToGroup);

// Get users in a specific group
router.get('/:groupId/users', authenticate, groupController.getUsersInGroup);

// Get groups for a specific user
router.get('/:userId/groups', authenticate, groupController.getGroupsForUser);

router.put("/:groupId", authenticate, groupController.updateGroup);

module.exports = router;
