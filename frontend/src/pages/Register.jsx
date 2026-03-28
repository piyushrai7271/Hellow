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
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-xl font-semibold mb-4 text-center">Register</h2>

        <input
          className="w-full border p-2 mb-2 rounded"
          placeholder="Full Name"
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />

        <input
          className="w-full border p-2 mb-2 rounded"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />

        <input
          className="w-full border p-2 mb-2 rounded"
          placeholder="Mobile Number"
          onChange={(e) =>
            setForm({ ...form, mobileNumber: e.target.value })
          }
        />

        <input
          className="w-full border p-2 mb-2 rounded"
          placeholder="Bio"
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />

        <select
          className="w-full border p-2 mb-2 rounded"
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <input
          className="w-full border p-2 mb-4 rounded"
          placeholder="Password"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={handleRegister}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Register
        </button>

        <p
          className="text-sm text-center mt-3 cursor-pointer text-blue-500"
          onClick={() => navigate("/login")}
        >
          Already have an account? Login
        </p>
      </div>
    </div>
  );
};

export default Register;