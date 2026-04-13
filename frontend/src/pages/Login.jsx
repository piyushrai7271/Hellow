import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";
import { connectSocket } from "../socket/socket.js";
import toast from "react-hot-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // ✅ NEW

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await apiFetch("/api/user/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.success) {
      toast.success("Login successful 🎉");
      connectSocket();
      navigate("/chat");
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
      <form
        onSubmit={handleLogin}
        className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-80 border border-white/30"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Welcome Back 👋
        </h2>

        <input
          className="w-full border border-gray-300 p-2 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* PASSWORD FIELD WITH TOGGLE */}
        <div className="relative mb-5">
          <input
            className="w-full border border-gray-300 p-2 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Password"
            type={showPassword ? "text" : "password"} // ✅ TOGGLE
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/* TOGGLE BUTTON */}
          <span
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500 text-sm select-none"
          >
            {showPassword ? "Hide" : "Show"}
          </span>
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition duration-200 shadow-md"
        >
          Login
        </button>

        <p
          className="text-shadow-lg text-center mt-4 cursor-pointer text-indigo-600 hover:underline"
          onClick={() => navigate("/register")}
        >
          First time? Register
        </p>
      </form>
    </div>
  );
};

export default Login;