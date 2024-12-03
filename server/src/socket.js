const Message = require("./models/Message");
const User = require("./models/User");
const { translateText } = require("./config/translation");

module.exports = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`User ${userId} connected with socket ID: ${socket.id}`);

    socket.join(userId);

    socket.on("joinRoom", (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    socket.on("send-message", async ({ senderId, receiverId, content }) => {
      try {
        // Fetch receiver's language preference
        const receiver = await User.findById(receiverId);
        if (!receiver) {
          console.error("Receiver not found.");
          return;
        }

        // Translate message content to receiver's preferred language
        const translatedContent = await translateText(
          content,
          receiver.language
        );

        // Save the original and translated message to the database
        const message = new Message({
          sender: senderId,
          receiver: receiverId,
          content,
          translatedContent,
        });
        await message.save();

        // Emit the translated message to the receiver's room
        io.to(receiverId).emit("receive-message", {
          _id: message._id,
          senderId,
          receiverId,
          content: translatedContent, // Send the translated content
          originalContent: content, // Optionally include the original content
          // createdAt: message.createdAt,
          createdAt: new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes().toString().padStart(2, "0"),
        });
      } catch (error) {
        console.error("Error handling send-message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
