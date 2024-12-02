import React, { useEffect, useState, useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { getUserList } from "../services/api";
import { getMessages } from "../services/api";

const ChatList = () => {
  const { currentUser, setSelectedUser, messages, setMessages } =
    useContext(ChatContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await getUserList(currentUser.id);
      setUsers(data);
    };
    fetchUsers();
  }, [currentUser]);

  const handleUserClick = async (user) => {
    setSelectedUser(user);

    try {
      // Fetch chat messages from the server
      const { data } = await getMessages(currentUser.id, user._id);

      setMessages((prev) => ({
        ...prev,
        [user._id]: data,
      }));

      console.log("Fetched messages for user:", user._id, data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  return (
    <div className="w-1/3 h-screen border-r border-gray-300">
      <h2 className="text-lg font-bold p-4">Chats</h2>
      <div className="overflow-y-auto">
        {users.map((user) => (
          <div
            key={user._id}
            className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
            onClick={() => handleUserClick(user)}
          >
            {user.name} ({user.role})
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatList;
