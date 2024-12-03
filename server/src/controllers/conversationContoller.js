const Conversation = require("../models/Conversation");

// Fetch user list
exports.getUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all chats involving the logged-in user
    const chats = await Conversation.find({ participants: userId }).populate(
      "participants",
      "name role language"
    );

    // Filter out the logged-in user from participants
    const users = chats.map((chat) =>
      chat.participants.find((participant) => participant.id !== userId)
    );

    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching chat users:", error);
    res.status(500).json({ error: "Failed to fetch chat users" });
  }
};

// Fetch messages
exports.getMessages = async (req, res) => {
  const { userId, chatPartnerId } = req.params;

  try {
    // Find the conversation between the two participants
    const chat = await Conversation.findOne({
      participants: { $all: [userId, chatPartnerId] },
    });

    if (!chat) {
      console.log("No conversation found");
      return res.status(404).json({ message: "No conversation found." });
    }

    // Sort messages by timestamp before sending
    const sortedMessages = chat.messages.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    res.status(200).json(sortedMessages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res
      .status(500)
      .json({ message: "Fetching messages failed.", error: error.message });
  }
};
