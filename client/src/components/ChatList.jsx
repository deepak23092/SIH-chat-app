import React, { useEffect, useState, useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { getUserList, getMessages, getSingleUser } from "../services/api";
import { format } from "date-fns";
import { FiSearch } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import Image from "../assets/images/levi.jpg";

const ChatList = ({ onSelectChat }) => {
  const { currentUser, selectedUser, setSelectedUser, messages, setMessages } =
    useContext(ChatContext);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();
  const { user_id } = useParams();

  useEffect(() => {
    const fetchUsersAndMessages = async () => {
      try {
        const { data: userList } = await getUserList(currentUser.id);
        setUsers(userList);

        // Fetch messages for all users to prepopulate last message info
        const messagesMap = {};
        for (const user of userList) {
          const { data: userMessages } = await getMessages(
            currentUser.id,
            user._id
          );
          messagesMap[user._id] = userMessages;
        }
        setMessages((prev) => ({ ...prev, ...messagesMap }));

        // Select a user if `user_id` is in the URL
        if (user_id) {
          const existingUser = userList.find((user) => user._id === user_id);

          if (existingUser) {
            setSelectedUser(existingUser);
            onSelectChat(existingUser);
          } else {
            const { data: newUser } = await getSingleUser(user_id);
            if (newUser) {
              setUsers((prev) => {
                const isUserAlreadyPresent = prev.some(
                  (user) => user._id === newUser._id
                );
                return isUserAlreadyPresent ? prev : [...prev, newUser];
              });
              setSelectedUser(newUser);
              onSelectChat(newUser);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching users or messages:", error);
      }
    };

    fetchUsersAndMessages();
  }, [currentUser, user_id, onSelectChat, setSelectedUser, setMessages]);

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    onSelectChat(user);
    navigate(`/chat/1mPRX1JgejlEYDsiEL93/${user._id}`);

    if (!messages[user._id]) {
      try {
        const { data } = await getMessages(currentUser.id, user._id);
        setMessages((prev) => ({
          ...prev,
          [user._id]: data,
        }));
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
  };

  const getLastMessage = (userId) => {
    const userMessages = messages[userId] || [];
    if (userMessages.length > 0) {
      const lastMessage = userMessages[userMessages.length - 1];
      return {
        content: lastMessage.content,
        timestamp: lastMessage.timestamp,
        formattedTimestamp: format(
          new Date(lastMessage.timestamp),
          "dd/MM/yy, HH:mm"
        ),
      };
    }
    return null;
  };

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedUsers = filteredUsers.sort((a, b) => {
    const lastMessageA = getLastMessage(a._id);
    const lastMessageB = getLastMessage(b._id);

    const timestampA = lastMessageA
      ? new Date(lastMessageA.timestamp).getTime()
      : 0;
    const timestampB = lastMessageB
      ? new Date(lastMessageB.timestamp).getTime()
      : 0;

    return timestampB - timestampA;
  });

  return (
    <div className="w-full md:w-[30rem] h-screen border-r border-gray-300 flex flex-col">
      <div className="p-4 border-b bg-gray-100">
        <h2 className="text-lg font-bold">INBOX</h2>
        <div className="mt-2 flex items-center border rounded p-2 bg-white">
          <FiSearch className="text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search"
            className="ml-2 w-full focus:outline-none text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="overflow-y-auto flex-grow bg-white">
        {sortedUsers.map((user) => {
          const lastMessage = getLastMessage(user._id);
          return (
            <div
              key={user._id}
              className={`p-4 flex items-center justify-between border-b cursor-pointer hover:bg-gray-100 ${
                selectedUser?._id === user._id ? "bg-gray-200" : ""
              }`}
              onClick={() => handleUserClick(user)}
            >
              <div className="flex items-center">
                <img
                  src={user.image || Image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full mr-3"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {lastMessage
                      ? `${lastMessage.content.substring(0, 20)}...`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                {lastMessage ? lastMessage.formattedTimestamp : ""}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatList;
