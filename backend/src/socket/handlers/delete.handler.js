import { deleteMessageService } from "../../services/message.service.js";
import { emitMessageDeleted } from "../../services/event.service.js";

const registerDeleteMessage = (io, socket) => {
  socket.on("delete-message", async ({ messageId, type }) => {
    if (!messageId || !type) return;

    try {
      const result = await deleteMessageService({
        messageId,
        userId: socket.userId,
        type,
      });

      emitMessageDeleted(io, {
        members: result.members,
        messageId: result.messageId,
        type: result.type,
      });

    } catch (error) {
      console.error("Delete message error:", error.message);
    }
  });
};

export { registerDeleteMessage };