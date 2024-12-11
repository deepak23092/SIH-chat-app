const Conversation = require("../models/Conversation");
const db = require("../firebase");
const { doc, getDoc, collection } = require("firebase/firestore");

exports.getUsers = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all chats involving the logged-in user
    const chats = await Conversation.find({ participants: userId });

    // Process each chat to get other participants and productId
    const userPromises = chats.map(async (chat) => {
      const otherParticipantId = chat.participants.find(
        (participant) => participant !== userId
      );

      if (otherParticipantId) {
        // Fetch user details from Firestore
        const userDocRef = doc(collection(db, "users"), otherParticipantId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const { imageUrl, name } = userDoc.data();
          return {
            _id: otherParticipantId,
            image: imageUrl || null,
            name: name || "Unknown",
            productId: chat.productId || null, // Extract productId from the chat
          };
        }
      }
      return null;
    });

    // Resolve all user details and filter out any null values
    const userList = (await Promise.all(userPromises)).filter((user) => user);

    // Send response
    res.status(200).json(userList);
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

// Fetch user by ID
exports.getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    // Since your schema doesn't directly define users, fetch based on participants
    const chat = await Conversation.findOne({ participants: userId });
    if (!chat) {
      return res
        .status(404)
        .json({ message: "User not found in conversations." });
    }

    // Extract participant data
    const user = {
      id: userId,
      chats: chat.messages.filter(
        (msg) => msg.senderId === userId || msg.receiverId === userId
      ),
    };

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch user.", error: error.message });
  }
};
