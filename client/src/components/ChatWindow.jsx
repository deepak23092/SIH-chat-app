import React, { useContext, useState, useEffect } from "react";
import { ChatContext } from "../context/ChatContext";
import { sendMessage, getMessages } from "../services/api";

const ChatWindow = () => {
  const { currentUser, selectedUser, messages, setMessages, socket } =
    useContext(ChatContext);
  const [newMessage, setNewMessage] = useState("");
  const [price, setPrice] = useState("");

  const predefinedMessages = ["Deal Done!!", "Not Possible", "Okay", "Thank You!", "Let's Discuss"];
  const priceOptions = [3120, 3340, 2500]; // Predefined price options

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

  const handleSend = async (message = newMessage) => {
    if (message.trim()) {
      const messageData = {
        senderId: currentUser.id,
        receiverId: selectedUser._id,
        content: message,
        createdAt: new Date(Date.now()).getHours() +
        ":" +
        new Date(Date.now()).getMinutes().toString().padStart(2, "0"),
      };

      socket.emit("send-message", messageData);

      setMessages((prev) => ({
        ...prev,
        [selectedUser._id]: [
          ...(prev[selectedUser._id] || []),
          { ...messageData, sender: currentUser.id, _id: Math.random() },
        ],
      }));

      // Clear input if the message was manually typed
      if (message === newMessage) setNewMessage("");

      try {
        await sendMessage(messageData);
      } catch (error) {
        console.error("Message failed to send:", error);
      }
    }
  };
  const handleMakeOffer = () => {
    if (price && price.toString().trim()) {
      const offerMessage = `I would like to offer ₹${price} for the deal.`;
      handleSend(offerMessage); // Send the offer message
      setPrice(""); // Clear the price input after sending
    }
  };

  const handlePriceClick = (value) => {
    setPrice(value); // Set the input to the clicked price option
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
                  <span className="block text-xs text-gray-500 mt-1">
        {msg.createdAt || "Unknown time"} {/* Fallback for missing timestamps */}
      </span>
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <div className="mb-4 flex gap-2">
              {predefinedMessages.map((msg, index) => (
                <button
                  key={index}
                  className="px-3 py-1 bg-gray-200 rounded shadow hover:bg-gray-300"
                  onClick={() => handleSend(msg)} // Pass predefined message
                >
                  {msg}
                </button>
              ))}
            </div>
            <input
              type="text"
              className="w-full p-2 border rounded"
              placeholder="Type a message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)} // Track manually typed message
            />
            <button
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={() => handleSend()} // Send typed message
            >
              Send
            </button>
          </div>

          {/* Price discussion section */}
          <div className="p-4 border-t">
            <div className="flex gap-2 items-center">
              <div className="flex gap-2">
                {priceOptions.map((priceOption, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 bg-gray-200 rounded shadow hover:bg-gray-300"
                    onClick={() => handlePriceClick(priceOption)} // Set the price when clicked
                  >
                    ₹{priceOption}
                  </button>
                ))}
              </div>
              <div className="relative w-2/4">
                <input
                  type="number"
                  className="w-full p-2 border rounded text-xl pl-12"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)} // Track price input
                  placeholder="Enter price"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 font-semibold text-3xl text-green-500">₹</div>
              </div>
              <button
                className="mt-2 px-6 py-3 bg-blue-500 text-white rounded text-l hover:bg-blue-600"
                onClick={handleMakeOffer} // Send the price offer
              >
                Make Offer
              </button>
            </div>
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
