import { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput.jsx";
import ChatHeader from "./ChatHeader.jsx";
import MessageMenu from "./MessageMenu.jsx";
import toast from "react-hot-toast";

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

  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editText, setEditText] = useState("");

  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef();

  const otherUserId = selectedChat?.members?.[0]?._id;
  const userStatus = userStatusMap?.[otherUserId] || {};

  // FORMAT TIME
  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // MESSAGE STATUS (FIXED ✅)
const getMessageStatus = (msg) => {
  if (!msg) return "sent";

  // ✅ Seen (highest priority)
  if (msg.seenBy?.includes(otherUserId)) return "seen";

  // ✅ Delivered (persistent, NOT dependent on online status)
  if (msg.deliveredTo?.includes(otherUserId)) return "delivered";

  // ✅ Sent (fallback)
  return "sent";
};

  const renderTicks = (msg) => {
    const status = getMessageStatus(msg);

    if (status === "sent") {
      return <span className="text-white/60 ml-1">✓</span>;
    }

    if (status === "delivered") {
      return <span className="text-white/90 ml-1">✓✓</span>;
    }

    if (status === "seen") {
      return <span className="text-yellow-300 ml-1">✓✓</span>;
    }
  };

  const renderMessageContent = (msg) => {
    if (msg.messageType === "image") {
      return (
        <img
          src={msg.fileUrl}
          alt="img"
          className="max-w-[200px] rounded-lg mt-1"
        />
      );
    }

    if (msg.messageType === "video") {
      return (
        <video
          src={msg.fileUrl}
          controls
          className="max-w-[200px] rounded-lg mt-1"
        />
      );
    }

    if (msg.messageType === "audio") {
      return <audio src={msg.fileUrl} controls className="mt-1" />;
    }

    if (msg.messageType === "file") {
      return (
        <a
          href={msg.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="underline text-blue-200 mt-1 block"
        >
          📄 Open File
        </a>
      );
    }

    return <span>{msg.message}</span>;
  };

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

  // TYPING
  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleTyping = ({ userId }) => {
      if (userId === otherUserId) setIsTyping(true);
    };

    const handleStopTyping = ({ userId }) => {
      if (userId === otherUserId) setIsTyping(false);
    };

    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);

    return () => {
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
    };
  }, [socket, selectedChat, otherUserId]);

  // DELETE LISTENER
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
                  isDeleted: true,
                }
              : msg
          )
        );
      }
    });

    return () => socket.off("message-deleted");
  }, [socket]);

  // EDIT LISTENER
  useEffect(() => {
    if (!socket) return;

    socket.on("message-edited", ({ messageId, newMessage, isEdited }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId
            ? { ...msg, message: newMessage, isEdited }
            : msg
        )
      );
    });

    return () => socket.off("message-edited");
  }, [socket]);

// ✅ DELIVERY LISTENER (FIXED 🔥)
  useEffect(() => {
    if (!socket) return;

    socket.on("message-delivered", ({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId
            ? {
                ...msg,
                deliveredTo: Array.from(
                  new Set([...(msg.deliveredTo || []), userId])
                ),
              }
            : msg
        )
      );
    });

    return () => socket.off("message-delivered");
  }, [socket]);

  
  const handleDelete = (messageId, type) => {
    if (!socket) {
      toast.error("Connection lost ❌");
      return;
    }

    try {
      socket.emit("delete-message", { messageId, type });
    } catch {
      toast.error("Failed to delete message ❌");
    }

    setActiveMenu(null);
  };

  const handleEditStart = (msg) => {
    setEditingMsgId(msg.messageId);
    setEditText(msg.message);
    setActiveMenu(null);
  };

  const handleEditSave = (messageId) => {
    if (!editText.trim()) return;

    if (!socket) {
      toast.error("Connection lost ❌");
      return;
    }

    try {
      socket.emit("edit-message", {
        messageId,
        newMessage: editText,
      });
    } catch {
      toast.error("Failed to edit message ❌");
    }

    setEditingMsgId(null);
    setEditText("");
  };

  const handleSend = () => {
    if (!input.trim() || !selectedChat) return;

    if (!socket) {
      toast.error("Connection lost ❌");
      return;
    }

    const toUserId = selectedChat.members[0]._id;

    try {
      socket.emit("private-message", {
        toUserId,
        message: input,
      });
    } catch {
      toast.error("Message failed to send ❌");
      return;
    }

    setInput("");
  };

  if (!selectedChat && messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <p className="text-xl mb-2">💬 Welcome!</p>
        <p className="text-sm">Select a chat or start a new conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <ChatHeader
        selectedChat={selectedChat}
        isOnline={userStatus.isOnline}
        lastSeen={userStatus.lastSeen}
        isTyping={isTyping}
      />

      <div className="flex-1 overflow-y-auto p-4 bg-[#f1f5f9]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg">👋 Start conversation</p>
            <p className="text-sm">Send your first message</p>
          </div>
        ) : (
          messages.map((msg, i) => {
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
                      // ✅ EDIT UI RESTORED
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
                            className="px-3 text-black py-1 text-xs rounded-md bg-gray-200"
                          >
                            Cancel
                          </button>

                          <button
                            onClick={() => handleEditSave(msg.messageId)}
                            className="px-3 py-1 text-xs rounded-md bg-blue-500 text-white"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {renderMessageContent(msg)}

                        <div className="text-[10px] mt-1 flex justify-end items-center gap-1 opacity-80">
                          {formatTime(msg.createdAt)}
                          {isMe && renderTicks(msg)}
                        </div>

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
                          prev === msg.messageId
                            ? null
                            : msg.messageId
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
                    messageType={msg.messageType}
                    isDeleted={msg.isDeleted}
                  />
                </div>
              </div>
            );
          })
        )}

        <div ref={bottomRef}></div>
      </div>

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