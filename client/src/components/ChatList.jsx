import React, { useEffect, useState, useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { getUserList, getMessages } from "../services/api";
import { format } from "date-fns";
import { FiSearch } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import Image from "../assets/images/levi.jpg";

const ChatList = ({ onSelectChat }) => {
  const { messages, setMessages } = useContext(ChatContext);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [messagesMap, setMessagesMap] = useState({});

  const navigate = useNavigate();
  let { user_id, senderId } = useParams();

  user_id = user_id || senderId;

  useEffect(() => {
    const fetchUsersAndMessages = async () => {
      try {
        const { data: userList } = await getUserList(user_id);
        setUsers(userList);

        // Fetch messages for all users to prepopulate last message info
        const messagesMap = {};
        for (const user of userList) {
          const { data: userMessages } = await getMessages(user_id, user._id);
          messagesMap[user._id] = userMessages;
        }
        setMessagesMap(messagesMap);

        // Select a user if `user_id` is in the URL
      } catch (error) {
        console.error("Error fetching users or messages:", error); //issue************
      }
    };

    fetchUsersAndMessages(); //issue**************
  }, [user_id, onSelectChat, setMessages]);

  const handleUserClick = async (user) => {
    onSelectChat(user);
    navigate(`/chat/${user_id}/${user._id}/${user.productId}`);

    if (!messagesMap[user._id]) {
      try {
        const { data } = await getMessages(user_id, user._id);
        setMessages((prev) => [...data]);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
  };

  const getLastMessage = (userId) => {
    const userMessages = messagesMap[userId] || [];
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
              className={`p-4 flex items-center justify-between border-b cursor-pointer hover:bg-gray-100 `}
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
