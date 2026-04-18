import { markAsSeenService } from "../../services/message.service.js";
import { emitMessagesSeen } from "../../services/event.service.js";

const registerSeen = (io, socket) => {
  socket.on("mark-as-seen", async ({ chatId }) => {
    if (!chatId) return;

    try {
      const result = await markAsSeenService({
        chatId,
        userId: socket.userId,
      });

      emitMessagesSeen(io, result);

    } catch (error) {
      console.error("Seen error:", error.message);
    }
  });
};

export { registerSeen };