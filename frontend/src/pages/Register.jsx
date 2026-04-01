import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    bio: "",
    gender: "",
    password: "",
  });

  const handleRegister = async () => {
    const res = await apiFetch("/api/user/register", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (res.success) {
      navigate("/login");
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
      
      <div className="bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-96 border border-white/30">
        
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Create Account ✨
        </h2>

        <input
          className="w-full border border-gray-300 p-2 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Full Name"
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />

        <input
          className="w-full border border-gray-300 p-2 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="w-full border border-gray-300 p-2 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Mobile Number"
          onChange={(e) =>
            setForm({ ...form, mobileNumber: e.target.value })
          }
        />

        <input
          className="w-full border border-gray-300 p-2 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Bio"
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />

        <select
          className="w-full border border-gray-300 p-2 mb-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input
          className="w-full border border-gray-300 p-2 mb-5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Password"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-indigo-500 text-white py-2 rounded-lg hover:bg-indigo-600 transition duration-200 shadow-md"
        >
          Register
        </button>

        <p
          className="text-sm text-center mt-4 cursor-pointer text-indigo-600 hover:underline"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </p>

      </div>
    </div>
  );
};

export default Register;