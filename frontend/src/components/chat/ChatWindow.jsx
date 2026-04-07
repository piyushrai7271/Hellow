import { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput.jsx";
import ChatHeader from "./ChatHeader.jsx";
import MessageMenu from "./MessageMenu.jsx";

const ChatWindow = ({
  socket,
  selectedChat,
  messages = [],
  setMessages,
  currentUserId,
  userStatusMap,
}) => {
  const [input, setInput] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  // ✏️ EDIT STATE
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState("");

  // ✅ NEW: TYPING STATE
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef();

  // ✅ GET OTHER USER
  const otherUserId = selectedChat?.members?.[0]?._id;
  const userStatus = userStatusMap?.[otherUserId] || {};

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // CLOSE MENU
  useEffect(() => {
    const handleClick = () => setActiveMenu(null);
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  // =========================
  // ✅ NEW: TYPING LISTENER
  // =========================
  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleTyping = ({ userId }) => {
      if (userId === otherUserId) {
        setIsTyping(true);
      }
    };

    const handleStopTyping = ({ userId }) => {
      if (userId === otherUserId) {
        setIsTyping(false);
      }
    };

    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);

    return () => {
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
    };
  }, [socket, selectedChat, otherUserId]);

  // =========================
  // DELETE LISTENER
  // =========================
  useEffect(() => {
    if (!socket) return;

    socket.on("message-deleted", ({ messageId, type }) => {
      if (type === "delete-for-me") {
        setMessages((prev) =>
          prev.filter((msg) => msg.messageId !== messageId),
        );
      }

      if (type === "delete-for-everyone") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.messageId === messageId
              ? {
                  ...msg,
                  message: "This message was deleted",
                  isDeleted: true,
                }
              : msg,
          ),
        );
      }
    });

    return () => socket.off("message-deleted");
  }, [socket]);

  // =========================
  // ✏️ EDIT LISTENER
  // =========================
  useEffect(() => {
    if (!socket) return;

    socket.on("message-edited", ({ messageId, newMessage, isEdited }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId
            ? { ...msg, message: newMessage, isEdited }
            : msg,
        ),
      );
    });

    return () => socket.off("message-edited");
  }, [socket]);

  // =========================
  // DELETE
  // =========================
  const handleDelete = (messageId, type) => {
    socket.emit("delete-message", { messageId, type });
    setActiveMenu(null);
  };

  // =========================
  // START EDIT
  // =========================
  const handleEditStart = (msg) => {
    setEditingMsgId(msg.messageId);
    setEditText(msg.message);
    setActiveMenu(null);
  };

  // =========================
  // SAVE EDIT
  // =========================
  const handleEditSave = (messageId) => {
    if (!editText.trim()) return;

    socket.emit("edit-message", {
      messageId,
      newMessage: editText,
    });

    setEditingMsgId(null);
    setEditText("");
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
    };

    setMessages((prev) => [...prev, tempMsg]);

    socket.emit("private-message", {
      toUserId,
      message: input,
    });

    setInput("");
  };

  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        Select a chat
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* HEADER */}
      <ChatHeader
        selectedChat={selectedChat}
        isOnline={userStatus.isOnline}
        lastSeen={userStatus.lastSeen}
        isTyping={isTyping} // ✅ NEW
      />

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#f1f5f9]">
        {messages.map((msg, i) => {
          const isMe = String(msg.fromUserId) === String(currentUserId);

          return (
            <div
              key={msg.messageId || i}
              className={`mb-4 flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className="relative group">
                <div
                  className={`px-4 py-2 max-w-xs break-words shadow ${
                    isMe
                      ? "bg-blue-500 text-white rounded-2xl"
                      : "bg-white text-black rounded-2xl"
                  }`}
                >
                  {msg.isDeleted ? (
                    <p className="italic text-sm opacity-70">
                      This message was deleted
                    </p>
                  ) : editingMsgId === msg.messageId ? (
                    <div className="bg-white p-2 rounded-lg shadow-inner">
                      <input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        autoFocus
                        className="w-full px-3 py-2 text-sm text-black border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-blue-400"
                      />

                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingMsgId(null)}
                          className="px-3 text-black py-1 text-xs rounded-md bg-gray-200 hover:bg-gray-300 transition"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={() => handleEditSave(msg.messageId)}
                          className="px-3 py-1 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 transition shadow-sm"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {msg.message}
                      {msg.isEdited && (
                        <span className="text-[10px] ml-1 opacity-70">
                          (edited)
                        </span>
                      )}
                    </>
                  )}
                </div>

                {isMe && !msg.isDeleted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu((prev) =>
                        prev === msg.messageId ? null : msg.messageId,
                      );
                    }}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-xs bg-white rounded-full px-1 shadow"
                  >
                    ⋮
                  </button>
                )}

                <MessageMenu
                  isOpen={activeMenu === msg.messageId}
                  messageId={msg.messageId}
                  onDelete={handleDelete}
                  onEdit={() => handleEditStart(msg)}
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