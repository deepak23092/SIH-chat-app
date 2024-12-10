const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: [{ type: String, required: true }],
  messages: [
    {
      senderId: { type: String },
      receiverId: { type: String },
      content: { type: String },
      translatedContent: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
