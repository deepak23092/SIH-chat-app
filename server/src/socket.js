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
        // Fetch sender and receiver language preferences
        const sender = await User.findById(senderId);
        const receiver = await User.findById(receiverId);

        if (!sender || !receiver) {
          console.error("Sender or receiver not found.");
          return;
        }

        let translatedContent = content;

        // Only translate if sender's language differs from receiver's language
        if (sender.language !== receiver.language) {
          console.log(
            `Translating message from '${sender.language}' to '${receiver.language}'`
          );
          translatedContent = await translateText(content, receiver.language);
          console.log("Translated contentt:", translatedContent);
        } else {
          console.log("No translation needed.");
        }

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
          content: translatedContent,
          originalContent: content,
          createdAt: message.createdAt,
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
