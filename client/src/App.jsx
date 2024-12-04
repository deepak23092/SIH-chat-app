import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import { ChatProvider } from "./context/ChatContext";

const App = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  const isMobile = window.innerWidth <= 768;

  return (
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/chat"
            element={
              <div className="flex">
                {isMobile ? (
                  selectedChat ? (
                    <ChatWindow
                      chatId={selectedChat?._id}
                      onBack={() => setSelectedChat(null)}
                    />
                  ) : (
                    <ChatList onSelectChat={setSelectedChat} />
                  )
                ) : (
                  <>
                    <ChatList onSelectChat={setSelectedChat} />
                    <ChatWindow chatId={selectedChat?._id} />
                  </>
                )}
              </div>
            }
          />
        </Routes>
      </Router>
    </ChatProvider>
  );
};

export default App;
