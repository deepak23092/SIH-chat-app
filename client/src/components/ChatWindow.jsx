import React, { useContext, useState, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { getMessages } from "../services/api";

const ChatWindow = () => {
  const { currentUser, selectedUser, messages, setMessages, socket } =
    useContext(ChatContext);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      if (selectedUser) {
        try {
          const { data } = await getMessages(currentUser.id, selectedUser._id);

          // Add fetched messages to the context under the selected user's ID
          setMessages((prev) => ({
            ...prev,
            [selectedUser._id]: data,
          }));
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };
    fetchMessages();

    // Listen for incoming messages from the selected user
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
        timestamp: new Date().toISOString(),
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
    }
  };

  const userMessages = messages[selectedUser?._id] || [];

  console.log("userMessages: ", userMessages);

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
                className={`p-2 my-2 flex ${
                  msg.senderId === currentUser.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg text-sm max-w-xs bg-blue-200 text-black`}
                >
                  <p>{msg.content}</p>
                </div>
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
