import { sendPrivateMessageService } from "../../services/message.service.js";
import { handleMessageDelivery } from "../../services/delivery.service.js";
import {
  emitPrivateMessage,
  emitMessageDelivered,
} from "../../services/event.service.js";
import { EVENTS } from "../../config/event.js";

const registerPrivateChat = (io, socket) => {
  socket.on("private-message", async ({ toUserId, message, messageType, fileUrl }) => {

    if (!toUserId || (!message && !fileUrl)) {
      return socket.emit(EVENTS.ERROR, "Invalid data");
    }

    try {
      const { chat, message: savedMessage } =
        await sendPrivateMessageService({
          fromUserId: socket.userId,
          toUserId,
          message,
          messageType,
          fileUrl,
        });

      const payload = {
        messageId: savedMessage._id.toString(),
        chatId: chat._id.toString(),
        fromUserId: socket.userId.toString(),
        message: savedMessage.message,
        messageType: savedMessage.messageType,
        fileUrl: savedMessage.fileUrl,
        createdAt: savedMessage.createdAt,
      };

      emitPrivateMessage(io, {
        toUserId,
        fromUserId: socket.userId,
        payload,
      });

      const delivered = await handleMessageDelivery({
        message: savedMessage,
        toUserId,
      });

      if (delivered) {
        emitMessageDelivered(io, {
          fromUserId: socket.userId,
          messageId: savedMessage._id,
          toUserId,
        });
      }

    } catch (error) {
      console.error("Message error:", error.message);
      socket.emit(EVENTS.ERROR, "Failed to send message");
    }
  });
};

export { registerPrivateChat };