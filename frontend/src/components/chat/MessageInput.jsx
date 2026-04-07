import { useRef, useState } from "react";

const MessageInput = ({ input, setInput, onSend, socket, selectedChat }) => {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // ✅ NEW: typing timeout ref
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("message", file);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/chat/upload-message-file`,
        {
          method: "POST",
          body: formData,
          credentials: "include",
        }
      );

      const data = await res.json();

      if (data.success) {
        socket.emit("private-message", {
          toUserId: selectedChat.members[0]._id,
          messageType: data.data.messageType,
          fileUrl: data.data.fileUrl,
        });
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Something went wrong");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ✅ NEW: HANDLE TYPING
  const handleTyping = (value) => {
    setInput(value);

    if (!socket || !selectedChat) return;

    const toUserId = selectedChat.members[0]._id;

    // 🔥 send typing-start only once
    if (!isTypingRef.current) {
      socket.emit("typing-start", { toUserId });
      isTypingRef.current = true;
    }

    // 🧠 reset timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // ⏱️ stop typing after 1.5s of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-stop", { toUserId });
      isTypingRef.current = false;
    }, 1500);
  };

  // ✅ Handle menu click
  const handleSelectType = (type) => {
    if (!fileRef.current) return;

    if (type === "media") {
      fileRef.current.accept = "image/*,video/*";
    } else if (type === "document") {
      fileRef.current.accept = ".pdf,.doc,.docx,.txt";
    } else if (type === "audio") {
      fileRef.current.accept = "audio/*";
    }

    fileRef.current.click();
    setShowMenu(false);
  };

  // ✅ UPDATED SEND (stop typing immediately)
  const handleSendMessage = () => {
    if (!input.trim()) return;

    const toUserId = selectedChat.members[0]._id;

    socket?.emit("typing-stop", { toUserId });
    isTypingRef.current = false;

    onSend();
  };

  return (
    <div className="relative p-3 border-t flex gap-2 shrink-0">

      {/* ➕ BUTTON */}
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        disabled={uploading}
        className={`text-xl transition ${
          uploading
            ? "opacity-50 cursor-not-allowed"
            : "hover:text-blue-500"
        }`}
      >
        {uploading ? "⏳" : "➕"}
      </button>

      {/* 📂 MENU */}
      {showMenu && (
        <div className="absolute bottom-14 left-3 bg-white shadow-lg rounded-xl p-2 w-48 z-50 animate-fadeIn">

          <div
            onClick={() => handleSelectType("media")}
            className="p-2 hover:bg-gray-100 cursor-pointer rounded"
          >
            🖼️ Photos & Videos
          </div>

          <div
            onClick={() => handleSelectType("document")}
            className="p-2 hover:bg-gray-100 cursor-pointer rounded"
          >
            📄 Document
          </div>

          <div
            onClick={() => handleSelectType("audio")}
            className="p-2 hover:bg-gray-100 cursor-pointer rounded"
          >
            🎧 Audio
          </div>
        </div>
      )}

      {/* FILE INPUT */}
      <input
        type="file"
        hidden
        ref={fileRef}
        onChange={handleFile}
      />

      {/* TEXT INPUT */}
      <input
        value={input}
        onChange={(e) => handleTyping(e.target.value)} // ✅ UPDATED
        className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Type a message..."
      />

      {/* SEND BUTTON */}
      <button
        onClick={handleSendMessage} // ✅ UPDATED
        disabled={uploading}
        className={`px-4 py-2 rounded-lg text-white transition ${
          uploading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600"
        }`}
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;