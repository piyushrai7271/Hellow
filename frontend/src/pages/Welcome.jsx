import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to Hellow 💬</h1>
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Login / Register
        </button>
      </div>
    </div>
  );
};

export default Welcome;