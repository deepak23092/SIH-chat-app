import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ChatList from "./components/ChatList";
import ChatWindow from "./components/ChatWindow";
import { ChatProvider } from "./context/ChatContext";

const App = () => (
  <ChatProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/chat"
          element={
            <div className="flex">
              <ChatList />
              <ChatWindow />
            </div>
          }
        />
      </Routes>
    </Router>
  </ChatProvider>
);
export default App;
