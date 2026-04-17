import { editMessageService } from "../../services/message.service.js";

const registerEditMessage = (io, socket) => {
  socket.on("edit-message", async ({ messageId, newMessage }) => {
    if (!messageId || !newMessage?.trim()) return;

    try {
      const result = await editMessageService({
        messageId,
        userId: socket.userId,
        newMessage,
      });

      result.members.forEach((memberId) => {
        io.to(memberId.toString()).emit("message-edited", {
          messageId: result.messageId,
          newMessage: result.newMessage,
          isEdited: result.isEdited,
        });
      });
    } catch (error) {
      console.error("Edit message error:", error.message);
    }
  });
};

export { registerEditMessage };