import { sendPrivateMessageService } from "../../services/message.service.js";
import { handleMessageDelivery } from "../../services/delivery.service.js";

const registerPrivateChat = (io, socket) => {
  socket.on(
    "private-message",
    async ({ toUserId, message, messageType, fileUrl }) => {
      
      // validation
      if (!toUserId || (!message && !fileUrl)) {
        return socket.emit("error", "Invalid data");
      }

      try {
        // call service db logic
        const { chat, message: savedMessage } =
          await sendPrivateMessageService({
            fromUserId: socket.userId,
            toUserId,
            message,
            messageType,
            fileUrl,
          });

        // standered payload
        const payload = {
          messageId: savedMessage._id.toString(),
          chatId: chat._id.toString(),
          fromUserId: socket.userId.toString(),
          message: savedMessage.message,
          messageType: savedMessage.messageType,
          fileUrl: savedMessage.fileUrl,
          createdAt: savedMessage.createdAt,
        };

        // send to reciver
        io.to(toUserId.toString()).emit(
          "receive-private-message",
          payload
        );

        // send back to sender
        io.to(socket.userId.toString()).emit(
          "receive-private-message",
          payload
        );

        // deleviry move to service
        await handleMessageDelivery(io, {
          message: savedMessage,
          toUserId,
          fromUserId: socket.userId,
        });

        // stop typing
        io.to(toUserId.toString()).emit("user-stop-typing", {
          userId: socket.userId.toString(),
        });

      } catch (error) {
        console.error("Message error:", error.message);
        socket.emit("error", "Failed to send message");
      }
    }
  );
};

export { registerPrivateChat };