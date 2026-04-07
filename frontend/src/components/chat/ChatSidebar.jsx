const ChatSidebar = ({ chats, onSelectChat, typingUsers = {} }) => {

  const formatTime = (time) => {
    if (!time) return "";

    const date = new Date(time);
    const now = new Date();

    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr`;

    return date.toLocaleDateString();
  };

  const renderLastMessage = (msg, isTyping) => {
    if (isTyping) return "Typing..."; // ✅ NEW

    if (!msg) return "No messages yet";

    if (msg.messageType === "text" && msg.message) {
      return msg.message;
    }

    if (msg.messageType === "image") return "📷 Photo";
    if (msg.messageType === "file") return "📎 File";
    if (msg.messageType === "audio") return "🎧 Audio";

    return "No messages yet";
  };

  return (
    <div className="hidden md:flex w-[300px] bg-white border-r flex-col">

      <div className="p-4 border-b font-semibold text-lg bg-white sticky top-0 z-10">
        Chats
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {chats.map((chat) => {
          const user = chat.members[0];
          const lastMsg = chat.lastMessage;

          const isTyping = typingUsers[user?._id]; // ✅ NEW

          return (
            <div
              key={chat._id}
              onClick={() => onSelectChat(chat)}
              className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-100 border-b transition"
            >
              
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <p className="font-medium">{user?.fullName}</p>

                <p className="text-sm text-gray-500 truncate">
                  {renderLastMessage(lastMsg, isTyping)}

                  {!isTyping && lastMsg?.createdAt && (
                    <span className="ml-2 text-xs text-gray-400">
                      • {formatTime(lastMsg.createdAt)}
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatSidebar;