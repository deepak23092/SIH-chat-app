import React, { useContext, useState, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { sendMessage, getMessages } from "../services/api";

const ChatWindow = () => {
  const { currentUser, selectedUser, messages, setMessages, socket } =
    useContext(ChatContext);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser) {
        try {
          const { data } = await getMessages(currentUser.id, selectedUser._id);
          setMessages((prev) => ({
            ...prev,
            [selectedUser._id]: data.messages,
          }));
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };
    fetchMessages();

    socket.on("receive-message", (message) => {
      if (message.senderId === selectedUser._id) {
        setMessages((prev) => ({
          ...prev,
          [selectedUser._id]: [...(prev[selectedUser._id] || []), message],
        }));
      }
    });

    return () => {
      socket.off("receive-message");
    };
  }, [selectedUser, setMessages, socket]);

  const handleSend = async () => {
    if (newMessage.trim()) {
      const messageData = {
        senderId: currentUser.id,
        receiverId: selectedUser._id,
        content: newMessage,
      };

      socket.emit("send-message", messageData);

      setMessages((prev) => ({
        ...prev,
        [selectedUser._id]: [
          ...(prev[selectedUser._id] || []),
          { ...messageData, sender: currentUser.id, _id: Math.random() },
        ],
      }));
      setNewMessage("");

      try {
        await sendMessage(messageData);
      } catch (error) {
        console.error("Message failed to send:", error);
      }
    }
  };

  const userMessages = messages[selectedUser?._id] || [];

  return (
    <div className="w-2/3 h-screen flex flex-col">
      {selectedUser ? (
        <>
          <h2 className="text-lg font-bold p-4">
            Chat with {selectedUser.name}
          </h2>
          <div className="flex-grow overflow-y-auto p-4 bg-gray-50">
            {userMessages.map((msg) => (
              <div
                key={msg._id || Math.random()}
                className={`p-2 my-2 ${
                  msg.senderId === currentUser.id ? "text-right" : "text-left"
                }`}
              >
                <span
                  className={`inline-block px-4 py-2 rounded-lg ${
                    msg.senderId === currentUser.id
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {msg.content}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </>
      ) : (
        <div className="flex-grow flex items-center justify-center">
          <p>Select a user to start chatting.</p>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
