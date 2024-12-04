import React, { useState, useContext } from "react";
import { login } from "../services/api";
import { ChatContext } from "../context/ChatContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { setCurrentUser } = useContext(ChatContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login(credentials);

      localStorage.setItem("token", data.token);
      localStorage.setItem("userDetails", JSON.stringify(data.user));

      setCurrentUser(data.user);

      navigate("/chat/2/674f4583c8aa8845cea770d8");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form className="p-6 bg-white rounded shadow-md" onSubmit={handleLogin}>
        <h2 className="text-xl font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) =>
            setCredentials({ ...credentials, email: e.target.value })
          }
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) =>
            setCredentials({ ...credentials, password: e.target.value })
          }
        />
        <button className="w-full p-2 bg-blue-500 text-white rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
