document.addEventListener("DOMContentLoaded", async () => {
    const userListElement = document.getElementById("user-list");
    const chatMessages = document.getElementById("chat-messages");
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const loggedInUserElement = document.getElementById("logged-in-user");
    const logoutButton = document.getElementById("logout-button");
    const emojiPicker = document.getElementById("custom-emoji-picker");
    const emojiBtn = document.getElementById("emoji-btn");
    const groupList = document.getElementById("group-list");
    const openModalBtn = document.getElementById("open-create-group-modal");
    const closeModalBtn = document.getElementById("close-modal");
    const createUpdateGroupModal = document.getElementById("create-update-group-modal");
    const createUpdateGroupForm = document.getElementById("create-update-group-form");
    const groupMembersList = document.getElementById("group-members-list");

    const emojis = [
        "😀", "😂", "❤️", "👍", "🔥", "😎", "🎉", "😢", "👏", "🙏",
        "🤩", "🥳", "😜", "💡", "🍕", "🎂", "🏆", "📚", "✈️", "🌈"
    ];

    let currentChatUser = null;
    let currentChatType = "user"; // "user" or "group"
    let me = null;

    let isUpdatingGroup = false;
    let currentGroupId = null; // Store the ID of the group being updated


    // Populate emoji picker
    emojis.forEach((emoji) => {
        const emojiSpan = document.createElement("span");
        emojiSpan.textContent = emoji;
        emojiSpan.classList.add("emoji");
        emojiPicker.appendChild(emojiSpan);
    });

    emojiBtn.addEventListener("click", () => {
        emojiPicker.style.display = emojiPicker.style.display === "none" ? "flex" : "none";
    });

    document.addEventListener("click", (event) => {
        if (!emojiPicker.contains(event.target) && event.target !== emojiBtn) {
            emojiPicker.style.display = "none";
        }
    });

    emojiPicker.addEventListener("click", (event) => {
        if (event.target.classList.contains("emoji")) {
            chatInput.value += event.target.textContent;
        }
    });

    // Fetch and display logged-in user
    try {
        const meResponse = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (meResponse.ok) {
            me = await meResponse.json();
            loggedInUserElement.textContent = `Logged in as: ${me.username}`;
        } else {
            throw new Error("Failed to fetch logged-in user details");
        }
    } catch (error) {
        console.error(error);
    }

    // Fetch and display users
    try {
        const usersResponse = await fetch("/api/users", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const users = await usersResponse.json();
        userListElement.innerHTML = "";
        users.forEach((user) => {
            if (user.id === me.id) return;
            const userLink = document.createElement("a");
            userLink.href = "#";
            userLink.textContent = user.username;
            userLink.classList.add("user-link");
            userLink.addEventListener("click", (e) => {
                e.preventDefault();
                currentChatUser = { id: user.id, username: user.username };
                document.querySelector(".chat-section h3").textContent = `Chat with ${user.username}`;
                loadMessages(user.id);
            });
            const userItem = document.createElement("li");
            userItem.appendChild(userLink);
            userListElement.appendChild(userItem);
        });
    } catch (error) {
        console.error("Failed to fetch users:", error);
    }

    // Fetch and display groups
    async function fetchGroups() {
        try {
            const groupResponse = await fetch(`/api/groups/${me.id}/groups`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            const groups = await groupResponse.json();
            groupList.innerHTML = "";

            groups.forEach((group) => {
                const groupItem = document.createElement("li");
                const groupLink = document.createElement("a");
                groupLink.href = "#";
                groupLink.textContent = group.name;

                // Add click event listener for the group
                groupLink.addEventListener("click", (e) => {
                    e.preventDefault();
                    currentChatGroup = { id: group.id, name: group.name };
                    currentChatType = "group"; // Set the chat type to "group"

                    // Update the chat header with the group name and add an Update button
                    const chatHeader = document.querySelector(".chat-section h3");
                    chatHeader.innerHTML = `Chat with Group: ${group.name}`;

                    // Add an Update button to the chat header
                    const updateButton = document.createElement("button");
                    updateButton.textContent = "Update this group";
                    updateButton.classList.add("update-group-btn-header");
                    updateButton.addEventListener("click", () => openCreateUpdateGroupModal(group));

                    // Clear existing buttons in the header (if any) and append the Update button
                    const existingButtons = chatHeader.querySelectorAll("button");
                    existingButtons.forEach((button) => button.remove());
                    chatHeader.appendChild(updateButton);

                    // Load group messages
                    loadGroupMessages(group.id);
                });

                groupItem.appendChild(groupLink);
                groupList.appendChild(groupItem);
            });
        } catch (error) {
            console.error("Failed to fetch groups:", error);
        }
    }

    // Open modal
    function openCreateUpdateGroupModal(group = null) {
        isUpdatingGroup = !!group;
        currentGroupId = group ? group.id : null;

        // Update modal title and fields
        document.getElementById("create-update-group-modal-title").textContent =
            isUpdatingGroup ? "Update Group" : "Create Group";
        document.getElementById("group-members-label").textContent =
            isUpdatingGroup ? "Update members" : "Add members";
        document.getElementById("group-name").value = group ? group.name : "";
        document.getElementById("group-description").value = group ? group.description : "";

        // Fetch all users
        fetch("/api/users", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
            .then((res) => res.json())
            .then((allUsers) => {
                // If updating, fetch group members
                if (isUpdatingGroup && group) {
                    fetch(`/api/groups/${group.id}/users`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    })
                        .then((res) => res.json())
                        .then((groupData) => {
                            const groupUsers = groupData.users.map(user => user.id); // Extract user IDs
                            populateUserCheckboxes(allUsers, groupUsers); // Populate checkboxes with group members pre-checked
                        })
                        .catch((error) => {
                            console.error("Failed to fetch users in group:", error);
                        });
                } else {
                    // Just populate checkboxes for all users if creating
                    populateUserCheckboxes(allUsers, []);
                }
            })
            .catch((error) => {
                console.error("Failed to fetch all users:", error);
            });

        createUpdateGroupModal.style.display = "block";
    }

    function populateUserCheckboxes(allUsers, groupUsers) {
        groupMembersList.innerHTML = "";

        allUsers.forEach((user) => {
            // Skip adding the logged-in user (handled separately)
            if (user.id === me.id) return;

            const checkboxContainer = document.createElement("div");
            const checkbox = document.createElement("input");
            const label = document.createElement("label");

            checkbox.type = "checkbox";
            checkbox.value = user.id;
            checkbox.id = `user-${user.id}`;
            label.htmlFor = `user-${user.id}`;
            label.textContent = user.username;

            // Pre-select members if they are in the group
            if (groupUsers.includes(user.id)) {
                checkbox.checked = true;
            }

            checkboxContainer.appendChild(checkbox);
            checkboxContainer.appendChild(label);
            groupMembersList.appendChild(checkboxContainer);
        });
    }

    openModalBtn.addEventListener("click", () => {
        openCreateUpdateGroupModal(); // Call with no group to reset for creation

    });

    closeModalBtn.addEventListener("click", () => {
        createUpdateGroupModal.style.display = "none";
        isUpdatingGroup = false;
        currentGroupId = null;
    });


    // Submit group creation form
    createUpdateGroupForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const groupName = document.getElementById("group-name").value.trim();
        const groupDescription = document.getElementById("group-description").value.trim();
        const selectedMembers = Array.from(
            groupMembersList.querySelectorAll("input[type='checkbox']:checked")
        ).map((checkbox) => parseInt(checkbox.value));

        if (!groupName || !groupDescription || selectedMembers.length === 0) {
            alert("Please fill out all fields and select at least one member.");
            return;
        }

        const url = isUpdatingGroup
            ? `/api/groups/${currentGroupId}`
            : "/api/groups";
        const method = isUpdatingGroup ? "PUT" : "POST";

        // Ensure logged-in user is added to the members
        if (!selectedMembers.includes(me.id)) {
            selectedMembers.push(me.id);
        }

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    name: groupName,
                    description: groupDescription,
                    members: selectedMembers,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create or update group");
            }
            const updatedGroup = await response.json();

            createUpdateGroupModal.style.display = "none"; // Close the modal

            // Update the group name and description in the UI
            if (isUpdatingGroup && currentGroupId === updatedGroup.group.id) {
                // Update the group in the groups list
                const groupLink = document.querySelector(
                    `#group-list a[href='#'][data-group-id='${updatedGroup.group.id}']`
                );
                if (groupLink) {
                    groupLink.textContent = updatedGroup.group.name;
                }

                // Update the chat header if this is the currently active group
                if (currentChatType === "group" && currentChatGroup.id === updatedGroup.group.id) {
                    const chatHeader = document.querySelector(".chat-section h3");
                    chatHeader.innerHTML = `
                        Chat with Group: ${updatedGroup.group.name}
                        <button id="open-update-group-modal" class="update-group-btn-header">Update this group</button>
                    `;
                    // Add event listener for the Update button in the chat header
                    document.getElementById("open-update-group-modal").addEventListener("click", () => {
                        openCreateUpdateGroupModal(updatedGroup.group);
                    });
                }

            }
            fetchGroups(); // Refresh the group list
        } catch (error) {
            console.error("Failed to create/update group:", error);
        }
    });

    // Hide modal when clicking outside of it
    window.addEventListener("click", (event) => {
        if (event.target === createUpdateGroupModal) {
            createUpdateGroupModal.style.display = "none";
        }
    });


    await fetchGroups();

    async function loadMessages(userId) {
        try {
            const messagesResponse = await fetch(`/api/messages/${userId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (messagesResponse.ok) {
                const messages = await messagesResponse.json();
                chatMessages.innerHTML = messages
                    .map((message) => {
                        const messageClass = message.senderId === me.id ? "self" : "other";
                        return `<p class="chat-message ${messageClass}">${message.content}</p>`;
                    })
                    .join("");
                chatMessages.scrollTop = chatMessages.scrollHeight;
                chatInput.value = "";
            } else {
                throw new Error("Failed to load messages");
            }
        } catch (error) {
            console.error(error);
        }
    }

    async function loadGroupMessages(groupId) {
        try {
            const messagesResponse = await fetch(`/api/messages/group/${groupId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            if (messagesResponse.ok) {
                const messages = await messagesResponse.json();
                chatMessages.innerHTML = messages
                    .map((message) => {
                        const isSelf = message.senderId === me.id; // Check if it's your message
                        if (isSelf) {
                            // Render self-messages as <p>
                            return `
                            <p class="chat-message self">${message.content}</p>
                            `;
                        } else {
                            // Render other messages as <div> with sender name
                            return `
                                <div class="chat-message-container message-left">
                                    <small class="sender-name">${message.User?.username || "Unknown"}</small>
                                    <p class="chat-message other">${message.content}</p>
                                </div>
                            `;
                        }
                    })
                    .join("");
                chatMessages.scrollTop = chatMessages.scrollHeight;
                chatInput.value = "";
            } else {
                throw new Error("Failed to load group messages");
            }
        } catch (error) {
            console.error("Error loading group messages:", error);
        }
    }


    sendBtn.addEventListener("click", sendMessage);

    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    async function sendMessage() {
        const content = chatInput.value.trim();
        if (!content || !currentChatUser && !currentChatGroup) return;

        try {
            // Prepare the request payload
            const payload = {
                content,
            };

            // Check if the chat is a group or user and add the appropriate field
            if (currentChatType === "group") {
                payload.groupId = currentChatGroup.id; // Include groupId if it's a group chat
            } else if (currentChatType === "user") {
                payload.receiverId = currentChatUser.id; // Include receiverId if it's a user chat
            }

            // Send the message
            const sendResponse = await fetch(`/api/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(payload),
            });

            if (sendResponse.ok) {
                const newMessage = await sendResponse.json();
                chatMessages.innerHTML += `<p class="chat-message self">${newMessage.content}</p>`;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                chatInput.value = "";
            } else {
                throw new Error("Failed to send message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    }

    // Handle logout
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "/index.html";
    });

});
