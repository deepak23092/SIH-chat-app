import React, { useContext, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ChatContext } from "../context/ChatContext";
import { getMessages } from "../services/api";
import { FiArrowLeft } from "react-icons/fi";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

import { app } from "../firebase";

const ChatWindow = ({ senderId, receiverId, productId, onSelectChat }) => {
  const firestore = getFirestore(app);
  const { messages, setMessages, socket } = useContext(ChatContext);

  const [receiver, setReceiver] = useState(null);
  const [sender, setSender] = useState(null);
  const [product, setProduct] = useState(null);

  const [newMessage, setNewMessage] = useState("");
  const [offer, setOffer] = useState("");
  const [activeTab, setActiveTab] = useState("CHAT");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      if (receiverId) {
        try {
          const { data } = await getMessages(senderId, receiverId);
          setMessages((prev) => [...data]);
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      }
    };
    fetchMessages();
  }, [receiverId, senderId, setMessages]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (receiverId) {
          const receiverRef = doc(firestore, "users", receiverId);
          const receiverSnap = await getDoc(receiverRef);
          setReceiver(receiverSnap.exists() ? receiverSnap.data() : null);
        }

        if (senderId) {
          const senderRef = doc(firestore, "users", senderId);
          const senderSnap = await getDoc(senderRef);
          setSender(senderSnap.exists() ? senderSnap.data() : null);
        }

        if (productId) {
          const productRef = doc(firestore, "products", productId);
          const productSnap = await getDoc(productRef);
          setProduct(productSnap.exists() ? productSnap.data() : null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [receiverId, senderId, productId]);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (
        message.receiverId === receiverId ||
        message.senderId === receiverId
      ) {
        setMessages((prev) => [...prev, message]);
      }
    };

    if (socket) {
      socket.on("receive-message", handleReceiveMessage);
    }

    return () => {
      if (socket) {
        socket.off("receive-message", handleReceiveMessage);
      }
    };
  }, [receiverId, setMessages, socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (newMessage.trim()) {
      const messageData = {
        senderId,
        receiverId,
        productId,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };

      socket.emit("send-message", messageData);

      setMessages((prev) => [...prev, messageData]);
      setNewMessage("");
    }
  };

  const handleMakeOffer = () => {
    if (offer.trim()) {
      const offerMessage = `Offer: ₹${offer}`;
      const messageData = {
        senderId: senderId,
        receiverId: receiverId,
        productId,
        content: offerMessage,
        timestamp: new Date().toISOString(),
      };

      socket.emit("send-message", messageData);

      setMessages((prev) => [...prev, messageData]);
      setOffer("");
    }
  };

  const calculatePresetPrices = (price) => {
    if (!price) return [];
    return [price - 50, price - 100, price - 150, price - 200, price - 250];
  };

  const presetPrices = product ? calculatePresetPrices(product.price) : [];

  return (
    <div className="w-full h-screen flex flex-col">
      {receiverId ? (
        <>
          {/* Header */}
          <h2 className="flex items-center text-lg font-bold p-4 bg-gray-100">
            <button
              onClick={() => {
                navigate(`/chat/${senderId}`);
                onSelectChat(null);
              }}
              className="mr-2 text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft size={20} />
            </button>
            Chat with {receiver?.name}
          </h2>

          {/* Product Details */}
          {product ? (
            <div className="p-4 bg-white shadow">
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p>
                Price: ₹{(product.price / product.quantity) * 100} per 100kg
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
            {messages.map((msg) => (
              <div
                key={`${msg.timestamp}-${msg.senderId}`}
                className={`p-2 my-2 flex ${
                  msg.senderId === senderId ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`inline-block px-4 py-2 rounded-lg text-sm max-w-xs md:max-w-md ${
                    msg.senderId === senderId
                      ? "bg-blue-200 text-black"
                      : "bg-gray-300 text-black"
                  }`}
                >
                  <p>
                    {msg.senderId !== senderId
                      ? msg.translatedContent
                      : msg.content}
                  </p>
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
