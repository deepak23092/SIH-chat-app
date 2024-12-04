import React, { useContext, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { ChatContext } from "../context/ChatContext";
import { getMessages } from "../services/api";

const ChatWindow = () => {
  const { currentUser, selectedUser, messages, setMessages, socket } =
    useContext(ChatContext);
  const [newMessage, setNewMessage] = useState("");

  const productName = "Organic Apples";  // Static product name
  const productPrice = 9500;  // Static product price
  const MSP = productPrice - 0.2 * productPrice;
  const [offerPrice, setOfferPrice] = useState(MSP);

  const [offer, setOffer] = useState("");
  const [activeTab, setActiveTab] = useState("CHAT"); // Active tab: CHAT or MAKE OFFER
  const presetPrices = [productPrice ,productPrice - 0.01*productPrice, productPrice - 0.02*productPrice , productPrice - 0.05*productPrice, productPrice - 0.1*productPrice, productPrice - 0.15*productPrice];
  const [showDisclaimer, setShowDisclaimer] = useState(false); // To track if disclaimer should be shown
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
      // Check if the offer is less than MSP
      if (parseFloat(offer) < MSP) {
        setShowDisclaimer(true); // Show disclaimer if the offer is less than MSP
      } else {
        setShowDisclaimer(false); // Hide disclaimer if the offer is valid
      }

      // Check if the new offer is greater than the previous offer
      if (parseFloat(offer) > offerPrice) {
        console.log(`Previous Offer Price: ₹${offerPrice}`);
        console.log(`Updated Offer Price: ₹${offer}`);

        // Update the offerPrice to the new offer value
        setOfferPrice(offer);  // Update the offer price
      }

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

  // Check if the offer is less than MSP whenever the user types in the input field
  const handleOfferChange = (e) => {
    const value = e.target.value;
    setOffer(value);
    if (parseFloat(value) < MSP) {
      setShowDisclaimer(true); // Show disclaimer if the offer is less than MSP
    } else {
      setShowDisclaimer(false); // Hide disclaimer if the offer is valid
    }
  };

  return (
    <div className="w-2/3 h-screen flex flex-col">
      {selectedUser ? (
        <>
          <h2 className="text-lg font-bold p-3">
            Chat with {selectedUser.name}
          </h2>
          <div className="p-4 bg-gray-100 border-b flex justify-start items-center">
            <p className="text-sm text-gray-600 pr-4">
              <span className="font-semibold">Product Name:</span> {productName}
            </p>
            <p className="text-sm text-gray-600 pl-4">
              <span className="font-semibold">Product Price:</span>{productPrice}
            </p>
          </div>
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
                    ₹{price.toLocaleString()}
                  </button>
                ))}
              </div>
                <div className="flex items-center gap-2">
                  <span className={`text-green-500 font-bold text-3xl`}>₹</span>
                <input
                  type="number"
                  className="flex-1 p-2 border rounded"
                  placeholder="Enter your offer"
                  value={offer}
                  onChange={handleOfferChange} // Track offer input change
                />
                <button
                  className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
                  onClick={handleMakeOffer}
                >
                  Send Offer
                </button>
              </div>

              {/* Disclaimer text */}
              {showDisclaimer && (
                <p className="text-red-500 text-sm mt-2">
                  May be the farmer will not sell you at this price.
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center h-full">
          <p>Select a user to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
