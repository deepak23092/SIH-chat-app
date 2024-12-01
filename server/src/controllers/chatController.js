const Message = require("../models/Message");
const User = require("../models/User");
const { translateText } = require("../config/translation");

// Send a message
exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver)
      return res.status(404).json({ message: "Receiver not found." });

    const translatedContent = await translateText(content, receiver.language);

    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      translatedContent,
    });

    await message.save();

    res.status(201).json({ message: "Message sent.", data: message });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Message sending failed.", error: error.message });
  }
};

// Fetch messages
exports.getMessages = async (req, res) => {
  const { userId, chatPartnerId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: chatPartnerId },
        { sender: chatPartnerId, receiver: userId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Fetching messages failed.", error: error.message });
  }
};
