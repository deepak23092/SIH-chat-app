import React, { useContext, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ChatContext } from "../context/ChatContext";
import { getMessages } from "../services/api";

const ChatWindow = () => {
  const { currentUser, selectedUser, messages, setMessages, socket } =
    useContext(ChatContext);
  const [newMessage, setNewMessage] = useState("");

  const [offer, setOffer] = useState("");
  const [activeTab, setActiveTab] = useState("CHAT"); // Active tab: CHAT or MAKE OFFER
  const presetPrices = [9500, 9000, 8500, 8000, 7600];
  const messagesEndRef = useRef(null);

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

  useEffect(() => {
    // Scroll to the bottom of the chat messages whenever they are updated
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages[selectedUser?._id]]);

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

  const handleMakeOffer = () => {
    if (offer.trim()) {
      const offerMessage = `Offer: ₹${offer}`;
      const messageData = {
        senderId: currentUser.id,
        receiverId: selectedUser._id,
        content: offerMessage,
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
      setOffer("");
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
                className={`p-2 my-2 flex ${
                  msg.senderId === currentUser.id
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg text-sm max-w-xs ${
                    msg.senderId === currentUser.id
                      ? "bg-blue-200 text-black"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(msg.timestamp), "hh:mm a, MMM d")}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>

          <div className="flex items-center border">
            <button
              className={`flex-1 p-4 ${
                activeTab === "CHAT" ? "bg-gray-200 font-bold" : "bg-white"
              }`}
              onClick={() => setActiveTab("CHAT")}
            >
              CHAT
            </button>
            <button
              className={`flex-1 p-4 ${
                activeTab === "MAKE OFFER"
                  ? "bg-gray-200 font-bold"
                  : "bg-white"
              }`}
              onClick={() => setActiveTab("MAKE OFFER")}
            >
              MAKE OFFER
            </button>
          </div>

          {activeTab === "CHAT" ? (
            <div className="flex flex-col p-4">
              <div className="flex gap-2 mb-4">
                {[
                  "is it available?",
                  "what's your location?",
                  "make an offer",
                  "are you there?",
                  "please reply",
                ].map((quickMessage, index) => (
                  <button
                    key={index}
                    className="px-4 py-2 bg-gray-200 rounded"
                    onClick={() => setNewMessage(quickMessage)}
                  >
                    {quickMessage}
                  </button>
                ))}
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={handleSend}
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col p-4">
              <div className="flex gap-2 mb-4">
                {presetPrices.map((price, index) => (
                  <button
                    key={index}
                    className={`px-4 py-2 rounded border ${
                      offer === price.toString() ? "bg-gray-200" : "bg-white"
                    }`}
                    onClick={() => setOffer(price.toString())}
                  >
                    ₹ {price.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded"
                  placeholder="Enter your offer"
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                />
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={handleMakeOffer}
                >
                  Send
                </button>
              </div>
            </div>
          )}
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