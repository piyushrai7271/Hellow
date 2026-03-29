import Message from "../../models/message.model.js";
import Chat from "../../models/chat.model.js";

const registerSeen = (io, socket) => {
  socket.on("mark-as-seen", async ({ chatId }) => {
    if (!chatId) return;

    try {
      // Update messages
      await Message.updateMany(
        {
          chatId,
          senderId: { $ne: socket.userId },
        },
        {
          $addToSet: { seenBy: socket.userId },
        }
      );

      // Notify other users
      const chat = await Chat.findById(chatId);

      chat.members.forEach((memberId) => {
        if (memberId.toString() !== socket.userId.toString()) {
          io.to(memberId.toString()).emit("messages-seen", {
            chatId,
            seenBy: socket.userId.toString(),
          });
        }
      });

    } catch (error) {
      console.error("Seen error:", error);
    }
  });
};

export { registerSeen };