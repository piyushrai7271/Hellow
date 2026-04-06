const MessageMenu = ({ isOpen, onClose, onDelete, messageId }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-50 overflow-hidden"
    >
      {/* Delete for me */}
      <button
        onClick={() => onDelete(messageId, "delete-for-me")}
        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-200 transition"
      >
        Delete for me
      </button>

      {/* Delete for everyone */}
      <button
        onClick={() => onDelete(messageId, "delete-for-everyone")}
        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-200 transition"
      >
        Delete for everyone
      </button>
    </div>
  );
};

export default MessageMenu;