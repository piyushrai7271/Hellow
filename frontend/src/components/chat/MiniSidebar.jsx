import { apiFetch } from "../../api/api.js";
import { disconnectSocket } from "../../socket/socket.js";

const MiniSidebar = ({ openUsers }) => {
  const handleLogout = async () => {
    await apiFetch("/api/user/logout", { method: "POST" });
    disconnectSocket();
    window.location.href = "/login";
  };

  return (
    <div className="w-16 bg-[#0f172a] text-white flex flex-col items-center py-4 justify-between">
      
      {/* TOP SECTION */}
      <div className="flex flex-col items-center gap-6">
        {/* App Logo */}
        <div className="text-2xl">💬</div>

        {/* New Chat */}
        <button
          onClick={openUsers}
          className="bg-green-500 p-2 rounded-xl hover:bg-green-600 transition"
          title="New Chat"
        >
          +
        </button>
      </div>

      {/* BOTTOM SECTION */}
      <div className="flex flex-col items-center gap-4">
        
        {/* Settings */}
        <button
          className="p-2 rounded-lg hover:bg-white/10 transition"
          title="Settings"
        >
          ⚙️
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 rounded-lg hover:bg-red-500/20 transition text-red-400 hover:text-red-500"
        >
          🚪
        </button>
      </div>
    </div>
  );
};

export default MiniSidebar;