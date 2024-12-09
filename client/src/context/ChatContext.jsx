import { io } from "socket.io-client";
import React, { createContext, useState, useEffect } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const newSocket = io("http://localhost:5000", {
        auth: { token: currentUser.token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      setSocket(newSocket);

      newSocket.on("receive-message", (message) => {
        setMessages((prev) => ({
          ...prev,
          [message.senderId]: [...(prev[message.senderId] || []), message],
        }));
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      newSocket.on("disconnect", () => {
        console.warn("Socket disconnected.");
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
