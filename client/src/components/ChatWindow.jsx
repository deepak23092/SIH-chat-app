import React, { useContext, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ChatContext } from "../context/ChatContext";
import { getMessages } from "../services/api";
import { FiArrowLeft } from "react-icons/fi";
import { useParams } from "react-router-dom";

// Sample Product JSON
const demoProducts = {
  1: { name: "Tomatoes", price: 50, quantity: "10 kg", farmerId: "123" },
  2: { name: "Potatoes", price: 30, quantity: "20 kg", farmerId: "124" },
};

const ChatWindow = ({ onBack }) => {
  const {
    currentUser,
    selectedUser,
    setSelectedUser,
    messages,
    setMessages,
    socket,
  } = useContext(ChatContext);

  const { product_id } = useParams();

  const [newMessage, setNewMessage] = useState("");
  const [offer, setOffer] = useState("");
  const [activeTab, setActiveTab] = useState("CHAT");
  const presetPrices = [9500, 9000, 8500, 8000, 7600];
  const messagesEndRef = useRef(null);

  const [product, setProduct] = useState(null);

  useEffect(() => {
    // Fetch product details from demo JSON
    if (product_id) {
      setProduct(demoProducts[product_id]);
    }
  }, [product_id]);

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
    <div className="w-full h-screen flex flex-col">
      {selectedUser ? (
        <>
          {/* Header */}
          <h2 className="flex items-center text-lg font-bold p-4 bg-gray-100">
            <button
              onClick={() => {
                setSelectedUser(null);
                onBack();
              }}
              className="mr-2 text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft size={20} />
            </button>
            Chat with {selectedUser.name}
          </h2>

          {/* Product Details */}
          <div className="p-4 bg-white shadow">
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p>Price: ₹{product.price} per kg</p>
            <p>Quantity: {product.quantity}</p>
          </div>

          {/* Messages */}
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
                  className={`inline-block px-4 py-2 rounded-lg text-sm max-w-xs md:max-w-md ${
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

          {/* Tabs */}
          <div className="flex items-center border bg-gray-100">
            <button
              className={`flex-1 p-2 sm:p-4 ${
                activeTab === "CHAT" ? "bg-gray-200 font-bold" : "bg-white"
              }`}
              onClick={() => setActiveTab("CHAT")}
            >
              CHAT
            </button>
            <button
              className={`flex-1 p-2 sm:p-4 ${
                activeTab === "MAKE OFFER"
                  ? "bg-gray-200 font-bold"
                  : "bg-white"
              }`}
              onClick={() => setActiveTab("MAKE OFFER")}
            >
              MAKE OFFER
            </button>
          </div>

          {/* Input Area */}
          {activeTab === "CHAT" ? (
            <div className="flex flex-col p-2 sm:p-4">
              <div className="flex flex-wrap gap-2 mb-2 sm:mb-4">
                {[
                  "is it available?",
                  "what's your location?",
                  "make an offer",
                  "are you there?",
                  "please reply",
                ].map((quickMessage, index) => (
                  <button
                    key={index}
                    className="px-2 py-1 sm:px-4 sm:py-2 bg-gray-200 rounded text-sm"
                    onClick={() => setNewMessage(quickMessage)}
                  >
                    {quickMessage}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded text-sm"
                  placeholder="Type a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  className="px-2 sm:px-4 py-2 bg-blue-500 text-white rounded text-sm"
                  onClick={handleSend}
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col p-2 sm:p-4">
              <div className="flex flex-wrap gap-2 mb-2 sm:mb-4">
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
                  className="flex-1 p-2 border rounded text-sm"
                  placeholder="Enter your offer"
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                />
                <button
                  className="px-2 sm:px-4 py-2 bg-blue-500 text-white rounded text-sm"
                  onClick={handleMakeOffer}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex-grow flex items-center justify-center text-center p-4">
          <p className="text-sm sm:text-base">
            Select a user to start chatting.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
