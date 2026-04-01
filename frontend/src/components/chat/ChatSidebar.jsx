const ChatSidebar = ({ chats, onSelectChat }) => {
  return (
    <div className="hidden md:flex w-[300px] bg-white border-r flex-col">

      {/* HEADER */}
      <div className="p-4 border-b font-semibold text-lg bg-white sticky top-0 z-10">
        Chats
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => onSelectChat(chat)}
            className="p-4 cursor-pointer hover:bg-gray-100 border-b transition"
          >
            <p className="font-medium">
              {chat.members[0]?.fullName}
            </p>

            <p className="text-sm text-gray-500 truncate">
              {chat.lastMessage?.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatSidebar;