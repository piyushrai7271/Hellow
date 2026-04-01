const ChatHeader = ({ selectedChat, isTyping }) => {
  if (!selectedChat) return null;

  return (
    <div className="p-4 border-b flex justify-between items-center bg-white shrink-0">
      <div className="flex items-center gap-3">
        
        {/* Avatar */}
        <div className="w-10 h-10 bg-gray-300 rounded-full"></div>

        <div>
          <p className="font-semibold">
            {selectedChat.members[0]?.fullName}
          </p>

          {/* ✅ TYPING INDICATOR */}
          <p className="text-xs text-gray-500">
            {isTyping ? "Typing..." : "Last seen recently"}
          </p>
        </div>
      </div>

      <div className="cursor-pointer text-xl">⋮</div>
    </div>
  );
};

export default ChatHeader;