import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";
import { connectSocket } from "../socket/socket.js";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await apiFetch("/api/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.success) {
      connectSocket(); // ✅ same logic
      navigate("/chat");
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
      
      <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-80 border border-white/30">
        
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Welcome Back 👋
        </h2>

        <input
          className="w-full border border-gray-300 p-2 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full border border-gray-300 p-2 mb-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition duration-200 shadow-md"
        >
          Login
        </button>

        <p
          className="text-sm text-center mt-4 cursor-pointer text-indigo-600 hover:underline"
          onClick={() => navigate("/register")}
        >
          First time? Register
        </p>

      </div>
    </div>
  );
};

export default Login;