import { io } from "socket.io-client";
import React, { createContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  const { productId } = useParams();

  useEffect(() => {
    if (productId) {
      const newSocket = io("http://localhost:5000", {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        query: { userId: productId },
      });

      setSocket(newSocket);

      // Handle receiving messages
      newSocket.on("receive-message", (messages) => {
        console.log("received messages: ", messages);
        setMessages((prev) => [...messages]);
      });

      // Handle connection errors
      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
      });

      // Handle disconnection
      newSocket.on("disconnect", () => {
        console.warn("Socket disconnected.");
      });

      // Cleanup on component unmount
      return () => {
        newSocket.off();
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [productId]);

  return (
    <ChatContext.Provider
      value={{
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
