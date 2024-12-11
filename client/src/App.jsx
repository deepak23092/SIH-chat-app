import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import { ChatProvider } from "./context/ChatContext";
import React from "react";

// ChatPage Component
const ChatPage = () => {
  const navigate = useNavigate();
  const { senderId, receiverId, productId } = useParams();
  const [selectedChat, setSelectedChat] = useState(null);

  // Detect mobile view
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Update on window resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Back navigation for mobile
  // const handleBack = () => {
  //   setSelectedChat(null);
  //   navigate("/chat"); // Go back to ChatList
  // };

  return (
    <div className="flex">
      {isMobile ? (
        selectedChat || receiverId ? (
          // Mobile: Show ChatWindow when a chat is selected
          <ChatWindow
            senderId={senderId}
            receiverId={receiverId}
            productId={productId}
            onSelectChat={(chatId) => setSelectedChat(chatId)}
          />
        ) : (
          // Mobile: Show ChatList if no chat is selected
          <ChatList onSelectChat={(chatId) => setSelectedChat(chatId)} />
        )
      ) : (
        // Desktop: Show both ChatList and ChatWindow
        <>
          <ChatList onSelectChat={(chatId) => setSelectedChat(chatId)} />
          {receiverId || selectedChat ? (
            <ChatWindow
              senderId={senderId}
              receiverId={receiverId || selectedChat}
              productId={productId}
              onSelectChat={(chatId) => setSelectedChat(chatId)}
            />
          ) : (
            <div className="flex-1 text-center">Select a chat to view</div>
          )}
        </>
      )}
    </div>
  );
};

// App Component
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* General Chat route */}
        <Route
          path="/chat/:user_id"
          element={
            <ChatProvider>
              <ChatPage />
            </ChatProvider>
          }
        />
        {/* Chat route with dynamic params */}

        <Route
          path="/chat/:senderId/:receiverId/:productId"
          element={
            <ChatProvider>
              <ChatPage />
            </ChatProvider>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
