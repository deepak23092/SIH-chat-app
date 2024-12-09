import { io } from "socket.io-client";
import React, { createContext, useState, useEffect } from "react";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const newSocket = io("http://localhost:5000", {
        query: { userId: currentUser.id },
        transports: ["websocket"],
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

      const currentUserId = currentUser.id; // Replace with the logged-in user's ID
      newSocket.emit('user-connected', currentUserId);

      // Listen for online users update
      newSocket.on('update-online-users', (users) => {
          setOnlineUsers(users);
      });

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    }
  }, [currentUser]);

  useEffect(() => {
    if (socket) {
      // Listen for typing events
      socket.on("user-typing", ({ senderId }) => {
        setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
      });
  
      // Listen for stop-typing events
      socket.on("user-stop-typing", ({ senderId }) => {
        setTypingUsers((prev) => ({ ...prev, [senderId]: false }));
      });
  
      return () => {
        socket.off("user-typing");
        socket.off("user-stop-typing");
      };
    }
  }, [socket]);

  return (
    <ChatContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        selectedUser,
        setSelectedUser,
        messages,
        setMessages,
        onlineUsers,
        setOnlineUsers,
        typingUsers,
        socket,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
