import React, { useState } from "react";
import { register } from "../services/api";

const Signup = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await register(userData);
      setSuccess(true);
    } catch (err) {
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form className="p-6 bg-white rounded shadow-md" onSubmit={handleSignup}>
        <h2 className="text-xl font-bold mb-4">Signup</h2>
        {success && (
          <p className="text-green-500 mb-2">
            Signup successful! Please login.
          </p>
        )}
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setUserData({ ...userData, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setUserData({ ...userData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) =>
            setUserData({ ...userData, password: e.target.value })
          }
        />
        <select
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setUserData({ ...userData, role: e.target.value })}
        >
          <option value="customer">Customer</option>
          <option value="farmer">Farmer</option>
        </select>
        <button className="w-full p-2 bg-blue-500 text-white rounded">
          Signup
        </button>
      </form>
    </div>
  );
};

export default Signup;
