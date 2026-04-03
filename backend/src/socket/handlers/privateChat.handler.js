import Message from "../../models/message.model.js";
import Chat from "../../models/chat.model.js";
import { onlineUsers } from "../../utils/onlineUsers.js";

const registerPrivateChat = (io, socket) => {
  socket.on(
    "private-message",
    async ({ toUserId, message, messageType, fileUrl }) => {
      // =========================
      // ✅ VALIDATION
      // =========================
      if (!toUserId || (!message && !fileUrl)) {
        return socket.emit("error", "Invalid data");
      }

      try {
        // =========================
        // ✅ FIND OR CREATE CHAT
        // =========================
        let chat = await Chat.findOne({
          isGroupChat: false,
          members: { $all: [socket.userId, toUserId] },
        });

        if (!chat) {
          chat = await Chat.create({
            members: [socket.userId, toUserId],
          });
        }

        // =========================
        // ✅ MESSAGE TYPE LOGIC
        // =========================
        let finalMessageType = "text";

        if (fileUrl) {
          if (messageType === "image") finalMessageType = "image";
          else if (messageType === "video") finalMessageType = "video";
          else finalMessageType = "file";
        }

        // =========================
        // ✅ SAVE MESSAGE
        // =========================
        const savedMessage = await Message.create({
          chatId: chat._id,
          senderId: socket.userId,
          message: message || "",
          messageType: finalMessageType,
          fileUrl: fileUrl || "",
          deliveredTo: [],
          seenBy: [],
        });

        // =========================
        // ✅ UPDATE LAST MESSAGE
        // =========================
        await Chat.findByIdAndUpdate(chat._id, {
          lastMessage: savedMessage._id,
        });

        // =========================
        // ✅ STANDARD PAYLOAD
        // =========================
        const payload = {
          messageId: savedMessage._id.toString(),
          chatId: chat._id.toString(),
          fromUserId: socket.userId.toString(),
          message: savedMessage.message,
          messageType: savedMessage.messageType,
          fileUrl: savedMessage.fileUrl,
          createdAt: savedMessage.createdAt,
        };

        // =========================
        // ✅ SEND TO RECEIVER
        // =========================
        io.to(toUserId.toString()).emit(
          "receive-private-message",
          payload
        );

        // =========================
        // ✅ 🔥 FIX: SEND BACK TO SENDER
        // =========================
        io.to(socket.userId.toString()).emit(
          "receive-private-message",
          payload
        );

        // =========================
        // ✅ DELIVERY LOGIC
        // =========================
        if (onlineUsers.has(toUserId.toString())) {
          await Message.findByIdAndUpdate(savedMessage._id, {
            $addToSet: { deliveredTo: toUserId },
          });

          io.to(socket.userId.toString()).emit("message-delivered", {
            messageId: savedMessage._id.toString(),
            userId: toUserId,
          });
        }

        // =========================
        // ✅ STOP TYPING EVENT
        // =========================
        io.to(toUserId.toString()).emit("user-stop-typing", {
          userId: socket.userId.toString(),
        });

      } catch (error) {
        console.error("Message error:", error);
        socket.emit("error", "Failed to send message");
      }
    }
  );
};

export { registerPrivateChat };