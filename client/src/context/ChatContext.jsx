import { io } from "socket.io-client";
import React, { createContext, useState, useEffect } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({}); // Object to store messages for each user
  const [socket, setSocket] = useState(null);

  // Load user details from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Initialize and manage socket connection
  useEffect(() => {
    if (currentUser) {
      const newSocket = io("http://localhost:5000", {
        query: { userId: currentUser.id },
        transports: ["websocket"],
      });

      setSocket(newSocket);

      // Handle incoming messages
      newSocket.on("receive-message", (message) => {
        if (message.receiverId === currentUser.id) {
          setMessages((prev) => ({
            ...prev,
            [message.senderId]: [...(prev[message.senderId] || []), message],
          }));
        }
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [currentUser]);

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        selectedUser,
        setSelectedUser,
        messages,
        setMessages,
        socket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
