const express = require("express");
const {
  getUsers,
  getMessages,
} = require("../controllers/conversationContoller");

const router = express.Router();

// Endpoint to get users with whom the logged-in user has chatted
router.get("/chats/:userId", getUsers);

// Endpoint to get messages
router.get("/:userId/:chatPartnerId", getMessages);

module.exports = router;
