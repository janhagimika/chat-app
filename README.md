# chat-app
node.js and javascript facebook like chat app

Chat Application
This is a Node.js-based chat application designed to manage users, groups, and messages efficiently. It includes features for group creation, updates with member management, and chat functionality.

Features

User Management:  

Display a list of registered users.

Chat directly with individual users.

Group Management:

Create, update, and manage groups.

Add or remove members from groups dynamically.

Pessimistic locking implemented for group updates to avoid conflicts.

Chat Functionality:

Send and receive messages in real-time for both user-to-user and group chats.

Emoji support for messages.

Security:

User authentication using tokens.

HTTPS support with SSL certificates for secure communication.

Prerequisites

Node.js: >= 16.x

PostgreSQL: Ensure you have a PostgreSQL database set up.

npm or yarn

SSL Certificates: Provide valid SSL certificates and a private key.


Installation

Clone the repository:

git clone <repository-url>

cd chat-app

Install dependencies:

npm install

Update paths:

Update the paths to SSL certificates in and server.js to match your environment and in db.js to match your database.

Run database migrations:

npx sequelize-cli db:migrate

Start the application:

cd chat-app

node server.js

Visit the application:

Open your browser and go to https://localhost:3001.











