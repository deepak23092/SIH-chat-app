const Conversation = require("./models/Conversation");
const { translateText } = require("./config/translation");
const db = require("./firebase");
const { doc, getDoc, collection } = require("firebase/firestore");

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
    socket.on(
      "send-message",
      async ({ senderId, receiverId, productId, content }) => {
        try {
          if (!senderId || !receiverId || !content) {
            console.error("Missing required fields in send-message event.");
            return;
          }

          // Fetch user data from Firebase
          const senderRef = doc(collection(db, "users"), senderId);
          const senderDoc = await getDoc(senderRef);

          const receiverRef = doc(collection(db, "users"), receiverId);
          const receiverDoc = await getDoc(receiverRef);

          if (!senderDoc.exists() || !receiverDoc.exists()) {
            console.error("One or both users not found in Firebase.");
            return;
          }

          const senderLan = senderDoc.data().language || "en";
          const receiverLan = receiverDoc.data().language || "en";

          let translatedContent = content;

          // Translate message if needed
          if (senderLan !== receiverLan) {
            try {
              translatedContent = await translateText(content, receiverLan);
              console.log(
                `Translated message from '${senderLan}' to '${receiverLan}':`,
                translatedContent
              );
            } catch (translateError) {
              console.error(
                "Error translating message:",
                translateError.message
              );
              translatedContent = content; // Fallback to original content
            }
          } else {
            console.log("No translation needed.");
          }

          // Check if a conversation exists between the users
          let chat = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
          });

          if (!chat) {
            chat = new Conversation({
              participants: [senderId, receiverId],
              messages: [],
              productId,
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
          io.to(productId).emit("receive-message", chat.messages);
          console.log("Message sent to room:", receiverId);
        } catch (error) {
          console.error("Error handling send-message:", error.message);
        }
      }
    );

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
