import { useEffect, useState } from "react";
import { getSocket } from "../../socket/socket.js";
import { apiFetch } from "../../api/api.js";

import MiniSidebar from "./MiniSidebar.jsx";
import ChatSidebar from "./ChatSidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import UserModal from "./UserModal.jsx";

const ChatLayout = () => {
  const [socket, setSocket] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showUsers, setShowUsers] = useState(false);

  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    setSocket(s);
  }, []);

  useEffect(() => {
    const getMe = async () => {
      const res = await apiFetch("/api/user/get-user-details");
      if (res.success) setCurrentUserId(res.data._id);
    };
    getMe();
  }, []);

  const fetchChats = async () => {
    const res = await apiFetch("/api/chat/allMessages");
    if (res.success) setChats(res.data.chats);
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchMessages = async (chatId) => {
    const res = await apiFetch(`/api/chat/messages/${chatId}`);

    if (res.success) {
      const normalized = res.data.messages.map((msg) => ({
        messageId: msg.messageId || msg._id,
        message: msg.message,
        messageType: msg.messageType || "text",
        fileUrl: msg.fileUrl || "",
        fromUserId:
          msg.fromUserId ||
          msg.senderId?._id ||
          msg.senderId,
      }));

      setMessages(normalized);
      socket?.emit("mark-as-seen", { chatId });
    }
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    fetchMessages(chat._id);
  };

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      if (data.chatId === selectedChat?._id) {
        setMessages((prev) => {
          const exists = prev.some(
            (msg) => msg.messageId === data.messageId
          );
          if (exists) return prev;
          return [...prev, data];
        });
      }

      fetchChats();
    };

    socket.off("receive-private-message");
    socket.on("receive-private-message", handleMessage);

    return () => {
      socket.off("receive-private-message", handleMessage);
    };
  }, [socket, selectedChat]);

  return (
    <div className="flex h-screen w-full overflow-hidden">

      {/* MINI SIDEBAR */}
      <MiniSidebar openUsers={() => setShowUsers(true)} />

      {/* CHAT SIDEBAR */}
      <div className="hidden md:flex w-[300px] border-r flex-col min-h-0">
        <ChatSidebar
          chats={chats}
          onSelectChat={handleSelectChat}
        />
      </div>

      {/* CHAT WINDOW */}
      <div className="flex-1 min-h-0 flex flex-col">
        <ChatWindow
          socket={socket}
          selectedChat={selectedChat}
          messages={messages}
          setMessages={setMessages}
          currentUserId={currentUserId}
        />
      </div>

      {/* MODAL */}
      {showUsers && (
        <UserModal
          onClose={() => setShowUsers(false)}
          refreshChats={fetchChats}
          currentUserId={currentUserId} // Add this
        />
      )}
    </div>
  );
};

export default ChatLayout;