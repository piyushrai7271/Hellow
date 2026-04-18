import { editMessageService } from "../../services/message.service.js";
import { emitMessageEdited } from "../../services/event.service.js";

const registerEditMessage = (io, socket) => {
  socket.on("edit-message", async ({ messageId, newMessage }) => {
    if (!messageId || !newMessage?.trim()) return;

    try {
      const result = await editMessageService({
        messageId,
        userId: socket.userId,
        newMessage,
      });

      emitMessageEdited(io, result);

    } catch (error) {
      console.error("Edit message error:", error.message);
    }
  });
};

export { registerEditMessage };