import { useRef, useState, useEffect } from "react";
import toast from "react-hot-toast";

const MessageInput = ({ input, setInput, onSend, socket, selectedChat }) => {
  const fileRef = useRef();
  const textareaRef = useRef();

  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const canSend = input.trim().length > 0;

  // ✅ AUTO RESIZE TEXTAREA
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

    const toastId = toast.loading("Uploading file...");

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
        toast.success("File sent 📤", { id: toastId });

        socket.emit("private-message", {
          toUserId: selectedChat.members[0]._id,
          messageType: data.data.messageType,
          fileUrl: data.data.fileUrl,
        });
      } else {
        toast.error("Upload failed ❌", { id: toastId });
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toast.error("Something went wrong ❌", { id: toastId });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  // ✅ TYPING
  const handleTyping = (value) => {
    setInput(value);

    if (!socket || !selectedChat) return;

    const toUserId = selectedChat.members[0]._id;

    if (!isTypingRef.current) {
      socket.emit("typing-start", { toUserId });
      isTypingRef.current = true;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-stop", { toUserId });
      isTypingRef.current = false;
    }, 1500);
  };

  // ✅ ENTER SEND / SHIFT ENTER NEW LINE
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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

  const handleSendMessage = () => {
    if (!canSend || !selectedChat) return;

    const toUserId = selectedChat.members[0]._id;

    socket?.emit("typing-stop", { toUserId });
    isTypingRef.current = false;

    onSend();
  };

  return (
    <div className="relative p-3 border-t flex gap-2 items-end">
      {/* ➕ BUTTON */}
      <button
        onClick={() => setShowMenu((prev) => !prev)}
        disabled={uploading}
        className={`text-xl transition ${
          uploading ? "opacity-50 cursor-not-allowed" : "hover:text-blue-500"
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
      <input type="file" hidden ref={fileRef} onChange={handleFile} />

      {/* TEXTAREA */}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => handleTyping(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        className="flex-1 p-2 border rounded-lg outline-none resize-none max-h-32 overflow-y-auto focus:ring-2 focus:ring-blue-400"
        placeholder="Type a message..."
      />

      {/* SEND BUTTON */}
      <button
        onClick={handleSendMessage}
        disabled={!canSend || uploading}
        className={`px-4 py-2 rounded-lg text-white transition ${
          !canSend || uploading
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