import React, { useContext, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ChatContext } from "../context/ChatContext";
import { getMessages } from "../services/api";
import { FiArrowLeft } from "react-icons/fi";
import { useParams } from "react-router-dom";

import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";

const ChatWindow = ({ onBack }) => {
  const firestore = getFirestore(app);

  const { product_id } = useParams();

  const {
    currentUser,
    selectedUser,
    setSelectedUser,
    messages,
    setMessages,
    socket,
  } = useContext(ChatContext);

  const [newMessage, setNewMessage] = useState("");
  const [offer, setOffer] = useState("");
  const [activeTab, setActiveTab] = useState("CHAT");
  const presetPrices = [9500, 9000, 8500, 8000, 7600];
  const messagesEndRef = useRef(null);

  const [product, setProduct] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (product_id) {
        try {
          const ref = doc(firestore, "products", product_id);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            setProduct(snap.data());
          } else {
            console.error("No product found with the given ID.");
          }
        } catch (error) {
          console.error("Error fetching product details:", error);
        }
      }
    };

    fetchProduct();
  }, [product_id, firestore]);

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
          {product ? (
            <div className="p-4 bg-white shadow">
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p>
                Price: ₹{product.price} per {product.quantityName}
              </p>
              <p>
                Quantity: {product.quantity} {product.quantityName}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-white shadow">
              <p className="text-sm text-gray-500">
                Loading product details...
              </p>
            </div>
          )}

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
                    className={`px-4 py-2 rounded ${
                      price === parseInt(offer, 10)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-black"
                    }`}
                    onClick={() => setOffer(price.toString())}
                  >
                    ₹{price}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="flex-1 p-2 border rounded text-sm"
                  placeholder="Enter your offer price"
                  value={offer}
                  onChange={(e) => setOffer(e.target.value)}
                />
                <button
                  className="px-2 sm:px-4 py-2 bg-green-500 text-white rounded text-sm"
                  onClick={handleMakeOffer}
                >
                  Send Offer
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="h-full flex justify-center items-center">
          <p>Select a user to start chatting.</p>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
