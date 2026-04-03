import { apiFetch } from "../../api/api.js";
import { disconnectSocket } from "../../socket/socket.js";
import { useNavigate } from "react-router-dom";

const MiniSidebar = ({ openUsers, currentUser, openProfile }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await apiFetch("/api/user/logout", { method: "POST" });
    disconnectSocket();
    navigate("/login");
  };

  const renderAvatar = () => {
    if (currentUser?.avatar?.url) {
      return (
        <img
          src={currentUser.avatar.url}
          onClick={openProfile}
          className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-transparent hover:border-green-400 transition"
        />
      );
    }

    return (
      <div
        onClick={openProfile}
        className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-semibold cursor-pointer hover:bg-indigo-600 transition"
      >
        {currentUser?.fullName?.charAt(0).toUpperCase()}
      </div>
    );
  };

  return (
    <div className="w-16 bg-[#111b21] text-white flex flex-col items-center py-4 justify-between shadow-lg">
      {/* TOP SECTION */}
      <div className="flex flex-col items-center gap-6">
        {/* APP LOGO */}
        <div className="text-2xl opacity-80 hover:opacity-100 transition cursor-default">
          💬
        </div>

        {/* NEW CHAT */}
        <button
          onClick={openUsers}
          title="New Chat"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 hover:bg-green-700 active:scale-95 transition"
        >
          +
        </button>
      </div>

      {/* BOTTOM SECTION */}
      <div className="flex flex-col items-center gap-5">
        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          title="Logout"
          className="w-10 h-10 flex items-center justify-center rounded-full text-red-400 hover:bg-red-500/20 hover:text-red-500 transition active:scale-95"
        >
          ⏻
        </button>

        {/* USER AVATAR */}
        <div className="relative group">
          {renderAvatar()}

          {/* SMALL ACTIVE DOT (optional WhatsApp feel) */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#111b21] rounded-full"></span>
        </div>
      </div>
    </div>
  );
};

export default MiniSidebar;

