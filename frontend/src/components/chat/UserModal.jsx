import { useEffect, useState, useRef } from "react";
import { apiFetch } from "../../api/api.js";

const UserModal = ({ onClose, refreshChats, currentUserId }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const listRef = useRef();

  // =========================
  // FETCH USERS
  // =========================
  const fetchUsers = async (searchText = "", pageNum = 1, reset = false) => {
    try {
      setLoading(true);

      const res = await apiFetch(
        `/api/user/all-users?search=${searchText}&page=${pageNum}&limit=20`
      );

      if (res.success) {
        const filteredUsers = res.data.users.filter(
          (user) => String(user._id) !== String(currentUserId)
        );

        setUsers((prev) =>
          reset ? filteredUsers : [...prev, ...filteredUsers]
        );

        setHasMore(res.data.hasMore);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchUsers("", 1, true);
  }, []);

  // =========================
  // SEARCH (DEBOUNCED)
  // =========================
  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      fetchUsers(search, 1, true);
    }, 400);

    return () => clearTimeout(delay);
  }, [search]);

  // =========================
  // INFINITE SCROLL
  // =========================
  const handleScroll = () => {
    const el = listRef.current;
    if (!el || loading || !hasMore) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUsers(search, nextPage);
    }
  };

  // =========================
  // CREATE CHAT
  // =========================
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* USER LIST */}
        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          {/* ✅ LOADER */}
          {loading && users.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              Loading users...
            </p>
          )}

          {/* ✅ NO RESULT */}
          {!loading && users.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-10 text-gray-500">
              <p className="text-lg">No users found</p>
              <p className="text-sm">Try searching something else</p>
            </div>
          )}

          {/* ✅ USER LIST */}
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => createChat(user._id)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-100 transition"
            >
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-semibold text-indigo-600">
                  {user.fullName?.charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <p className="font-medium text-sm">{user.fullName}</p>
                <p className="text-xs text-gray-500">Tap to chat</p>
              </div>
            </div>
          ))}

          {/* ✅ LOAD MORE INDICATOR */}
          {loading && users.length > 0 && (
            <p className="text-center text-gray-400 py-2">
              Loading more...
            </p>
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