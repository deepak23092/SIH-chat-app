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

// ChatPage Component
const ChatPage = () => {
  const navigate = useNavigate();
  const { seller_id, buyer_id, product_id } = useParams(); // Extract route params
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
  const handleBack = () => {
    setSelectedChat(null);
    navigate("/chat"); // Go back to ChatList
  };

  return (
    <div className="flex">
      {isMobile ? (
        selectedChat || buyer_id ? (
          // Mobile: Show ChatWindow when a chat is selected
          <ChatWindow
            sellerId={seller_id}
            buyerId={buyer_id}
            productId={product_id}
            onBack={handleBack}
          />
        ) : (
          // Mobile: Show ChatList if no chat is selected
          <ChatList onSelectChat={(chatId) => setSelectedChat(chatId)} />
        )
      ) : (
        // Desktop: Show both ChatList and ChatWindow
        <>
          <ChatList onSelectChat={(chatId) => setSelectedChat(chatId)} />
          {buyer_id || selectedChat ? (
            <ChatWindow
              sellerId={seller_id}
              buyerId={buyer_id || selectedChat}
              productId={product_id}
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
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* General Chat route */}
          <Route path="/chat" element={<ChatPage />} />
          {/* Chat route with dynamic params */}
          <Route path="/chat/:seller_id/:buyer_id/:product_id" element={<ChatPage />} />
        </Routes>
      </Router>
    </ChatProvider>
  );
};

export default App;
