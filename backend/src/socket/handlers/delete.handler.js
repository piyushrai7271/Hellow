import Message from "../../models/message.model.js";
import Chat from "../../models/chat.model.js";

const registerDeleteMessage = (io, socket) => {
  socket.on("delete-message", async ({ messageId, type }) => {
    if (!messageId || !type) return;

    try {
      const message = await Message.findById(messageId);

      if (!message) return;

      // ❌ Security check
      if (message.senderId.toString() !== socket.userId.toString()) {
        return;
      }

      // ============================
      // 🟢 DELETE FOR ME
      // ============================
      if (type === "delete-for-me") {
        await Message.findByIdAndUpdate(messageId, {
          $addToSet: { deletedFor: socket.userId },
        });

        socket.emit("message-deleted", {
          messageId,
          type: "delete-for-me",
        });
      }

      // ============================
      // 🔴 DELETE FOR EVERYONE
      // ============================
      if (type === "delete-for-everyone") {
        await Message.findByIdAndUpdate(messageId, {
          isDeleted: true,
          message: "This message was deleted",
        });

        const chat = await Chat.findById(message.chatId);

        chat.members.forEach((memberId) => {
          io.to(memberId.toString()).emit("message-deleted", {
            messageId,
            type: "delete-for-everyone",
          });
        });
      }

    } catch (error) {
      console.error("Delete message error:", error);
    }
  });
};

export { registerDeleteMessage };