import { useRef } from "react";

const MessageInput = ({ input, setInput, onSend, socket, selectedChat }) => {
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;

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
    }
  };

  return (
<div className="p-3 border-t flex gap-2 shrink-0">

      {/* FILE BUTTON */}
      <button
        onClick={() => fileRef.current.click()}
        className="text-xl hover:text-blue-500"
      >
        📎
      </button>

      <input
        type="file"
        hidden
        ref={fileRef}
        onChange={handleFile}
      />

      {/* TEXT INPUT */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Type a message..."
      />

      {/* SEND BUTTON */}
      <button
        onClick={onSend}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
      >
        Send
      </button>
    </div>
  );
};

export default MessageInput;