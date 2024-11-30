const { Group, User } = require('../index'); // Ensure models are correctly imported
const sequelize = require("../db");

// Create a new group
exports.createGroup = async (req, res) => {
    const { name, description, members } = req.body; // Accept members as an array of user IDs

    try {
        const group = await Group.create({ name, description });

        if (members && members.length > 0) {
            const users = await User.findAll({ where: { id: members } });
            await group.addUsers(users); // Associate users with the group
        }

        res.status(201).json({ message: 'Group created successfully', group });
    } catch (error) {
        console.error('Error creating group:', error);
        res.status(500).json({ message: 'Failed to create group', error });
    }
};


// Add a user to a group
exports.addUserToGroup = async (req, res) => {
    const { groupId, userId } = req.body;

    try {
        const group = await Group.findByPk(groupId);
        const user = await User.findByPk(userId);

        if (!group || !user) {
            return res.status(404).json({ message: 'Group or User not found' });
        }

        await group.addUser(user); // This uses the association
        res.status(200).json({ message: `User ${user.username} added to group ${group.name}` });
    } catch (error) {
        console.error('Error adding user to group:', error);
        res.status(500).json({ message: 'Failed to add user to group', error });
    }
};

// Fetch all users in a group
exports.getUsersInGroup = async (req, res) => {
    const { groupId } = req.params;

    try {
        const group = await Group.findByPk(groupId, {
            include: [{ model: User }],
        });

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        res.status(200).json({ groupName: group.name, users: group.Users });
    } catch (error) {
        console.error('Error fetching users in group:', error);
        res.status(500).json({ message: 'Failed to fetch users in group', error });
    }
};

exports.getGroupsForUser = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming you pass the user ID from the authentication middleware
        const user = await User.findByPk(userId, {
            include: {
                model: Group,
                through: { attributes: [] }, // Exclude extra pivot table data
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const groups = user.Groups; // Access the related groups
        res.json(groups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch groups' });
    }
};

exports.updateGroup = async (req, res) => {
    const { groupId } = req.params;
    const { name, description, members } = req.body;

    const transaction = await sequelize.transaction(); // Start a transaction

    try {
        // Find the group with a pessimistic lock
        const group = await Group.findByPk(groupId, {
            lock: transaction.LOCK.UPDATE, // Apply pessimistic locking
            transaction,
        });

        if (!group) {
            await transaction.rollback(); // Rollback transaction if group is not found
            return res.status(404).json({ error: "Group not found" });
        }

        // Update group details
        if (name) group.name = name;
        if (description) group.description = description;
        await group.save({ transaction });

        // Fetch current members with the same lock
        const currentMembers = await group.getUsers({ transaction });
        const currentMemberIds = currentMembers.map((user) => user.id);

        // Determine users to remove and add
        const usersToRemove = currentMemberIds.filter((id) => !members.includes(id));
        const usersToAdd = members.filter((id) => !currentMemberIds.includes(id));

        // Remove users
        if (usersToRemove.length > 0) {
            console.log("Removing users:", usersToRemove);
            const users = await User.findAll({ where: { id: usersToRemove }, transaction });
            await group.removeUsers(users, { transaction });
            console.log("Users removed successfully.");
        }

        // Add users
        if (usersToAdd.length > 0) {
            console.log("Adding users:", usersToAdd);
            const users = await User.findAll({ where: { id: usersToAdd }, transaction });
            await group.addUsers(users, { transaction });
            console.log("Users added successfully.");
        }

        // Commit transaction if everything succeeds
        await transaction.commit();
        res.status(200).json({ message: "Group updated successfully", group });
    } catch (error) {
        // Rollback transaction in case of any error
        await transaction.rollback();
        console.error("Error updating group:", error);
        res.status(500).json({ error: "An error occurred while updating the group" });
    }
};

