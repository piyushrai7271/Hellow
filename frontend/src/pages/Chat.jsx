import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";

const Chat = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await apiFetch("/api/user/logout", { method: "POST" });
    navigate("/login");
  };

  return (
    <div className="h-screen bg-gray-100">
      <div className="flex justify-between items-center p-4 bg-white shadow">
        <h1 className="text-lg font-semibold">Chat</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="flex items-center justify-center h-full">
        <h2 className="text-gray-500">Chat UI coming soon...</h2>
      </div>
    </div>
  );
};

export default Chat;