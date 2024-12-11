const express = require("express");
const {
  getUsers,
  getMessages,
  getUserById,
} = require("../controllers/conversationContoller");
const Conversation = require("../models/Conversation");

const router = express.Router();

// Endpoint to get users with whom the logged-in user has chatted
router.get("/chats/:userId", getUsers);

// Endpoint to get messages
router.get("/:userId/:chatPartnerId", getMessages);

//Endpoint to get a user by id
router.get("/:userId", getUserById);

// send message
router.post("/messages", async (req, res) => {
  try {
    const { senderId, receiverId, text } = req.body;

    // Check if a chat already exists between the users
    let chat = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!chat) {
      // If no chat exists, create a new one
      chat = new Conversation({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    // Add the new message to the chat
    chat.messages.push({
      senderId,
      receiverId,
      text,
    });

    await chat.save();

    res.status(201).json({ success: true, chat });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
