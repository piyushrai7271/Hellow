import { deleteMessageService } from "../../services/message.service.js";

const registerDeleteMessage = (io, socket) => {
  socket.on("delete-message", async ({ messageId, type }) => {
    if (!messageId || !type) return;

    try {
      const result = await deleteMessageService({
        messageId,
        userId: socket.userId,
        type,
      });

      // 🟢 DELETE FOR ME
      if (result.type === "delete-for-me") {
        socket.emit("message-deleted", {
          messageId: result.messageId,
          type: result.type,
        });
      }

      // 🔴 DELETE FOR EVERYONE
      if (result.type === "delete-for-everyone") {
        result.members.forEach((memberId) => {
          io.to(memberId.toString()).emit("message-deleted", {
            messageId: result.messageId,
            type: result.type,
          });
        });
      }
    } catch (error) {
      console.error("Delete message error:", error.message);
    }
  });
};

export { registerDeleteMessage };