const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: { type: String },
      translatedContent: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
