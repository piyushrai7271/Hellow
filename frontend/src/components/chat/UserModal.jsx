import { useEffect, useState } from "react";
import { apiFetch } from "../../api/api.js";

const UserModal = ({ onClose, refreshChats, currentUserId }) => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await apiFetch("/api/user/all-users");

    if (res.success) {
      // ✅ FILTER OUT LOGGED-IN USER
      const filteredUsers = res.data.filter(
        (user) => String(user._id) !== String(currentUserId)
      );

      setUsers(filteredUsers);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const createChat = async (userId) => {
    const res = await apiFetch("/api/chat/create-new-chat", {
      method: "POST",
      body: JSON.stringify({ otherUserId: userId }),
    });

    if (res.success) {
      refreshChats();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
      
      {/* MODAL BOX */}
      <div className="w-full max-w-md h-[90vh] bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
          <h2 className="font-semibold text-lg">Start New Chat</h2>
          <button onClick={onClose} className="text-xl hover:opacity-80">
            ✕
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="p-3 border-b">
          <input
            type="text"
            placeholder="Search users..."
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* USER LIST */}
        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <p className="text-center text-gray-500 mt-4">
              No users found
            </p>
          ) : (
            users.map((user) => (
              <div
                key={user._id}
                onClick={() => createChat(user._id)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
              >
                
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div>
                  <p className="font-medium text-sm">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    Tap to chat
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-3 border-t text-center">
          <button
            onClick={onClose}
            className="text-sm text-gray-600 hover:text-black"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserModal;