import { useEffect, useState } from "react";
import { getSocket } from "../../socket/socket.js";
import { apiFetch } from "../../api/api.js";
import toast from "react-hot-toast";

import MiniSidebar from "./MiniSidebar.jsx";
import ChatSidebar from "./ChatSidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import UserModal from "./UserModal.jsx";
import ProfilePanel from "./ProfilePanel.jsx";

const ChatLayout = () => {
  const [socket, setSocket] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [userStatusMap, setUserStatusMap] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  // SOCKET
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    setSocket(s);
  }, []);

  // GET CURRENT USER
  useEffect(() => {
    const getMe = async () => {
      const res = await apiFetch("/api/user/get-user-details");
      if (res.success) {
        setCurrentUser(res.data);
      } else {
        toast.error(res.message || "Failed to load user ❌");
      }
    };
    getMe();
  }, []);

  // FETCH CHATS
  const fetchChats = async () => {
    const res = await apiFetch("/api/chat/allMessages");
    if (res.success) {
      setChats(res.data.chats);
    } else {
      toast.error(res.message || "Failed to load chats ❌");
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // FETCH MESSAGES
  const fetchMessages = async (chatId) => {
    toast.loading("Loading messages...");
    const res = await apiFetch(`/api/chat/messages/${chatId}`);

    if (res.success) {
      const normalized = res.data.messages.map((msg) => ({
        messageId: msg.messageId || msg._id,
        message: msg.message,
        messageType: msg.messageType || "text",
        fileUrl: msg.fileUrl || "",
        fromUserId:
          msg.fromUserId || msg.senderId?._id || msg.senderId,

        // ✅ FIX: ADD THIS LINE (IMPORTANT)
        createdAt: msg.createdAt,
      }));

      setMessages(normalized);

      socket?.emit("mark-as-seen", { chatId });
      toast.dismiss();
    } else {
      toast.dismiss();
      toast.error(res.message || "Failed to load messages ❌");
    }
  };

  // SELECT CHAT
  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setShowProfile(false);

    setChats((prev) =>
      prev.map((c) =>
        c._id === chat._id ? { ...c, unreadCount: 0 } : c
      )
    );

    fetchMessages(chat._id);

    const otherUserId = chat.members[0]._id;
    socket?.emit("check-user-status", { userId: otherUserId });

    socket?.emit("mark-as-seen", { chatId: chat._id });
  };

  // MESSAGE LISTENER
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (data) => {
      if (!data) {
        toast.error("Message error ❌");
        return;
      }

      if (data.chatId === selectedChat?._id) {
        setMessages((prev) => {
          const exists = prev.some(
            (msg) => msg.messageId === data.messageId
          );
          if (exists) return prev;
          return [...prev, data];
        });

        socket.emit("mark-as-seen", { chatId: data.chatId });
      } else {
        setChats((prev) =>
          prev.map((chat) =>
            chat._id === data.chatId
              ? {
                  ...chat,
                  unreadCount: (chat.unreadCount || 0) + 1,
                }
              : chat
          )
        );
      }

      fetchChats();
    };

    socket.off("receive-private-message");
    socket.on("receive-private-message", handleMessage);

    return () => {
      socket.off("receive-private-message", handleMessage);
    };
  }, [socket, selectedChat]);

  // STATUS LISTENERS
  useEffect(() => {
    if (!socket) return;

    const handleOnline = ({ userId }) => {
      setUserStatusMap((prev) => ({
        ...prev,
        [userId]: { isOnline: true },
      }));
    };

    const handleOffline = ({ userId, lastSeen }) => {
      setUserStatusMap((prev) => ({
        ...prev,
        [userId]: { isOnline: false, lastSeen },
      }));
    };

    const handleStatus = ({ userId, isOnline, lastSeen }) => {
      setUserStatusMap((prev) => ({
        ...prev,
        [userId]: { isOnline, lastSeen },
      }));
    };

    socket.on("user-online", handleOnline);
    socket.on("user-offline", handleOffline);
    socket.on("user-status", handleStatus);

    return () => {
      socket.off("user-online", handleOnline);
      socket.off("user-offline", handleOffline);
      socket.off("user-status", handleStatus);
    };
  }, [socket]);

  // TYPING LISTENERS
  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ userId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [userId]: true,
      }));
    };

    const handleStopTyping = ({ userId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    };

    socket.on("user-typing", handleTyping);
    socket.on("user-stop-typing", handleStopTyping);

    return () => {
      socket.off("user-typing", handleTyping);
      socket.off("user-stop-typing", handleStopTyping);
    };
  }, [socket]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <MiniSidebar
        openUsers={() => setShowUsers(true)}
        currentUser={currentUser}
        openProfile={() => setShowProfile(true)}
      />

      <div className="hidden md:flex w-[300px] border-r flex-col min-h-0">
        {showProfile ? (
          <ProfilePanel
            user={currentUser}
            setUser={setCurrentUser}
            closeProfile={() => setShowProfile(false)}
          />
        ) : (
          <ChatSidebar
            chats={chats}
            onSelectChat={handleSelectChat}
            typingUsers={typingUsers}
          />
        )}
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <ChatWindow
          socket={socket}
          selectedChat={selectedChat}
          messages={messages}
          setMessages={setMessages}
          currentUserId={currentUser?._id}
          userStatusMap={userStatusMap}
        />
      </div>

      {showUsers && (
        <UserModal
          onClose={() => setShowUsers(false)}
          refreshChats={fetchChats}
          currentUserId={currentUser?._id}
        />
      )}
    </div>
  );
};

export default ChatLayout;