const Message = require("../models/Message");
const User = require("../models/User");
const { translateText } = require("../config/translation");

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
