const Conversation = require("./models/Conversation");
const User = require("./models/User");
const { translateText } = require("./config/translation");

const onlineUsers = {};

module.exports = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);

     // Listen for 'user-connected' event from the client
     socket.on('user-connected', (userId) => {
      onlineUsers[userId] = socket.id; // Map userId to socket ID
      console.log(`${userId} is now online.`);
      io.emit('update-online-users', Object.keys(onlineUsers)); // Broadcast online users
     });

    // Join a room for the connected user
    socket.join(userId);

    // Join a specific room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    });

     // Handle "typing" event
     socket.on("typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("user-typing", { senderId });
    });

    // Handle "stop-typing" event
    socket.on("stop-typing", ({ senderId, receiverId }) => {
      io.to(receiverId).emit("user-stop-typing", { senderId });
    });

    // Handle sending messages
    socket.on("send-message", async ({ senderId, receiverId, content }) => {
      try {
        // Validate required fields
        if (!senderId || !receiverId || !content) {
          console.error("Missing required fields in send-message event.");
          return;
        }

        // Fetch sender and receiver language preferences
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
          console.error("Sender or receiver not found.");
          return;
        }

        let translatedContent = content;

        // Translate message if languages differ
        if (sender.language !== receiver.language) {
          console.log(
            `Translating message from '${sender.language}' to '${receiver.language}'`
          );
          translatedContent = await translateText(content, receiver.language);
          console.log("Translated content:", translatedContent);
        } else {
          console.log("No translation needed.");
        }

        // Check if a conversation exists between the users
        let chat = await Conversation.findOne({
          participants: { $all: [senderId, receiverId] },
        });

        if (!chat) {
          // Create a new conversation if none exists
          chat = new Conversation({
            participants: [senderId, receiverId],
            messages: [],
          });
        }

        // Add the new message to the conversation
        const newMessage = {
          senderId,
          receiverId,
          content,
          translatedContent,
          createdAt: new Date(),
        };

        chat.messages.push(newMessage);
        await chat.save();

        // Emit the message to the receiver's room
        io.to(receiverId).emit("receive-message", {
          _id: newMessage._id,
          senderId,
          receiverId,
          content: translatedContent,
          originalContent: content,
          timestamp: newMessage.createdAt,
        });
      } catch (error) {
        console.error("Error handling send-message:", error.message);
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User ${userId} disconnected. Socket ID: ${socket.id}`);
      const disconnectedUser = Object.keys(onlineUsers).find(
        (key) => onlineUsers[key] === socket.id
      );
      if (disconnectedUser) {
        console.log(`${disconnectedUser} is now offline.`);
        io.emit('update-online-users', Object.keys(onlineUsers)); // Broadcast online users
    }
    });
  });
};