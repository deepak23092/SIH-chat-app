import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
} from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import { ChatProvider } from "./context/ChatContext";

const ChatPage = () => {
  const navigate = useNavigate();

  const { product_id, user_id } = useParams();
  const [selectedChat, setSelectedChat] = useState(null);

  const isMobile = window.innerWidth <= 768;

  return (
    <div className="flex">
      {isMobile ? (
        selectedChat || user_id ? (
          <ChatWindow
            chatId={user_id}
            onBack={() => {
              setSelectedChat(null);
              navigate("/chat");
            }}
          />
        ) : (
          <ChatList onSelectChat={setSelectedChat} />
        )
      ) : (
        <>
          <ChatList onSelectChat={setSelectedChat} />
          {user_id && <ChatWindow chatId={user_id} />}
        </>
      )}
    </div>
  );
};

const App = () => {
  return (
    <ChatProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:product_id/:user_id" element={<ChatPage />} />
        </Routes>
      </Router>
    </ChatProvider>
  );
};

export default App;
