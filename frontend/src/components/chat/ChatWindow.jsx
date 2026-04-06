import { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput.jsx";
import ChatHeader from "./ChatHeader.jsx";
import MessageMenu from "./MessageMenu.jsx"; // ✅ NEW

const ChatWindow = ({
  socket,
  selectedChat,
  messages = [],
  setMessages,
  currentUserId,
}) => {
  const [input, setInput] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  const bottomRef = useRef();

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // CLOSE MENU ON OUTSIDE CLICK
  useEffect(() => {
    const handleClick = () => setActiveMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // =========================
  // DELETE LISTENER
  // =========================
  useEffect(() => {
    if (!socket) return;

    socket.on("message-deleted", ({ messageId, type }) => {
      if (type === "delete-for-me") {
        setMessages((prev) =>
          prev.filter((msg) => msg.messageId !== messageId)
        );
      }

      if (type === "delete-for-everyone") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.messageId === messageId
              ? {
                  ...msg,
                  message: "This message was deleted",
                  messageType: "text",
                  fileUrl: "",
                  isDeleted: true,
                }
              : msg
          )
        );
      }
    });

    return () => socket.off("message-deleted");
  }, [socket, setMessages]);

  // =========================
  // DELETE ACTION
  // =========================
  const handleDelete = (messageId, type) => {
    socket.emit("delete-message", { messageId, type });
    setActiveMenu(null);
  };

  // =========================
  // SEND MESSAGE
  // =========================
  const handleSend = () => {
    if (!input.trim() || !selectedChat || !socket) return;

    const toUserId = selectedChat.members[0]._id;

    const tempMsg = {
      messageId: Date.now().toString(),
      message: input,
      messageType: "text",
      fromUserId: currentUserId,
      status: "sent",
    };

    setMessages((prev) => [...prev, tempMsg]);

    socket.emit("private-message", {
      toUserId,
      message: input,
    });

    setInput("");
  };

  // =========================
  // UI
  // =========================
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        Select a chat
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 w-full">

      {/* HEADER */}
      <ChatHeader selectedChat={selectedChat} />

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#f1f5f9]">
        {messages.map((msg, i) => {
          const isMe =
            String(msg.fromUserId) === String(currentUserId);

          return (
            <div
              key={msg.messageId || i}
              className={`mb-4 flex ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div className="relative group">

                {/* MESSAGE BOX */}
                <div
                  className={`px-4 py-2 max-w-xs break-words shadow ${
                    isMe
                      ? "bg-blue-500 text-white rounded-2xl rounded-br-none"
                      : "bg-white text-black rounded-2xl rounded-bl-none"
                  }`}
                >
                  {msg.isDeleted ? (
                    <p className="italic text-sm opacity-70">
                      This message was deleted
                    </p>
                  ) : (
                    <>
                      {msg.messageType === "text" && msg.message}

                      {msg.messageType === "image" && msg.fileUrl && (
                        <img
                          src={msg.fileUrl}
                          className="w-40 rounded mt-1"
                        />
                      )}

                      {msg.messageType === "file" && msg.fileUrl && (
                        <a
                          href={msg.fileUrl}
                          target="_blank"
                          className="underline text-blue-200"
                        >
                          Download File
                        </a>
                      )}
                    </>
                  )}
                </div>

                {/* MENU BUTTON */}
                {isMe && !msg.isDeleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu((prev) =>
                        prev === msg.messageId ? null : msg.messageId
                      );
                    }}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition text-xs bg-white rounded-full px-1 shadow"
                  >
                    ⋮
                  </button>
                )}

                {/* ✅ MESSAGE MENU COMPONENT */}
                <MessageMenu
                  isOpen={activeMenu === msg.messageId}
                  messageId={msg.messageId}
                  onDelete={handleDelete}
                  onClose={() => setActiveMenu(null)}
                />
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