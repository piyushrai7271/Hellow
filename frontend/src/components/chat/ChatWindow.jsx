import { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput.jsx";
import ChatHeader from "./ChatHeader.jsx";

const ChatWindow = ({
  socket,
  selectedChat,
  messages = [],
  setMessages,
  currentUserId,
}) => {
  const [input, setInput] = useState("");
  const bottomRef = useRef();

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND MESSAGE
  const handleSend = () => {
    if (!input.trim() || !selectedChat || !socket) return;

    if (typeof setMessages !== "function") {
      console.error("❌ setMessages is not passed properly");
      return;
    }

    const toUserId = selectedChat.members[0]._id;

    const tempMsg = {
      messageId: Date.now().toString(),
      message: input,
      messageType: "text",
      fromUserId: currentUserId,
    };

    setMessages((prev) => [...prev, tempMsg]);

    socket.emit("private-message", {
      toUserId,
      message: input,
    });

    setInput("");
  };

  // ✅ EMPTY STATE (BETTER UI)
  if (!selectedChat) {
    return (
      <div className="flex-1 w-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <p className="text-lg">💬</p>
          <p>Select a chat to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col min-h-0">

      {/* HEADER */}
      <ChatHeader selectedChat={selectedChat} />

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#f1f5f9] min-h-0">
        {messages.map((msg, i) => {
          const isMe =
            String(msg.fromUserId) === String(currentUserId);

          return (
            <div
              key={msg.messageId || i}
              className={`mb-3 flex ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 max-w-xs break-words shadow-sm ${
                  isMe
                    ? "bg-blue-500 text-white rounded-2xl rounded-br-none"
                    : "bg-white text-black rounded-2xl rounded-bl-none"
                }`}
              >
                {/* TEXT */}
                {msg.messageType === "text" &&
                  msg.message &&
                  msg.message}

                {/* IMAGE */}
                {msg.messageType === "image" &&
                  msg.fileUrl && (
                    <img
                      src={msg.fileUrl}
                      className="w-40 rounded mt-1"
                    />
                  )}

                {/* FILE */}
                {msg.messageType === "file" &&
                  msg.fileUrl && (
                    <a
                      href={msg.fileUrl}
                      target="_blank"
                      className="underline text-blue-200"
                    >
                      Download File
                    </a>
                  )}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
      <MessageInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
        socket={socket}
        selectedChat={selectedChat}
      />
    </div>
  );
};

export default ChatWindow;