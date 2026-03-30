import Message from "../../models/message.model.js";
import Chat from "../../models/chat.model.js";
import { onlineUsers } from "../../utils/onlineUsers.js";

const registerPrivateChat = (io, socket) => {
  socket.on("private-message", async ({ toUserId, message, messageType, fileUrl }) => {
    
    // FIXED validation
    if (!toUserId || (!message && !fileUrl)) {
      return socket.emit("error", "Invalid data");
    }

    try {
      // Find or create chat
      let chat = await Chat.findOne({
        isGroupChat: false,
        members: { $all: [socket.userId, toUserId] },
      });

      if (!chat) {
        chat = await Chat.create({
          members: [socket.userId, toUserId],
        });
      }

      // ✅ decide message type properly
      const finalMessageType = messageType || (fileUrl ? "file" : "text");

      // Save message
      const savedMessage = await Message.create({
        chatId: chat._id,
        senderId: socket.userId,
        message: message || "",
        messageType: finalMessageType,
        fileUrl: fileUrl || "",
        deliveredTo: [],
        seenBy: [],
      });

      // Update last message
      await Chat.findByIdAndUpdate(chat._id, {
        lastMessage: savedMessage._id,
      });

      const payload = {
        messageId: savedMessage._id,
        chatId: chat._id,
        fromUserId: socket.userId.toString(),
        message: savedMessage.message,
        messageType: savedMessage.messageType,
        fileUrl: savedMessage.fileUrl,
        createdAt: savedMessage.createdAt,
      };

      // Send to receiver
      io.to(toUserId.toString()).emit("receive-private-message", payload);

      // Delivered logic
      if (onlineUsers.has(toUserId.toString())) {
        await Message.findByIdAndUpdate(savedMessage._id, {
          $addToSet: { deliveredTo: toUserId },
        });

        io.to(socket.userId.toString()).emit("message-delivered", {
          messageId: savedMessage._id,
          userId: toUserId,
        });
      }

      // Send back to sender
      io.to(socket.userId.toString()).emit("receive-private-message", payload);

      // ✅ typing stop (important UX)
      io.to(toUserId.toString()).emit("user-stop-typing", {
        userId: socket.userId.toString(),
      });

    } catch (error) {
      console.error("Message error:", error);
      socket.emit("error", "Failed to send message");
    }
  });
};

export { registerPrivateChat };



// Note:-...........
// 🧠 Important (Frontend must do this)
// typing-start → when user starts typing
// typing-stop → after 1–2 sec of no typing OR message sent
