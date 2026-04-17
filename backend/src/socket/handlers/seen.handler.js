import { markAsSeenService } from "../../services/message.service.js";

const registerSeen = (io, socket) => {
  socket.on("mark-as-seen", async ({ chatId }) => {
    if (!chatId) return;

    try {
      const result = await markAsSeenService({
        chatId,
        userId: socket.userId,
      });

      result.members.forEach((memberId) => {
        if (memberId.toString() !== socket.userId.toString()) {
          io.to(memberId.toString()).emit("messages-seen", {
            chatId: result.chatId,
            seenBy: result.seenBy,
          });
        }
      });
    } catch (error) {
      console.error("Seen error:", error.message);
    }
  });
};

export { registerSeen };