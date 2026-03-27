import Message from "../../models/message.model.js";
import Chat from "../../models/chat.model.js";

const registerPrivateChat = (io, socket) => {
  socket.on("private-message", async ({ toUserId, message }) => {
    if (!toUserId || !message) {
      return socket.emit("error", "Invalid data");
    }

    try {
      // 1️⃣ Find or create chat
      let chat = await Chat.findOne({
        isGroupChat: false,
        members: { $all: [socket.userId, toUserId] },
      });

      if (!chat) {
        chat = await Chat.create({
          members: [socket.userId, toUserId],
        });
      }

      // 2️⃣ Save message
      const savedMessage = await Message.create({
        chatId: chat._id,
        senderId: socket.userId,
        message: message,
        deliveredTo: [], // will handle later properly
      });

      // 3️⃣ Update last message (ONLY ONCE)
      await Chat.findByIdAndUpdate(chat._id, {
        lastMessage: savedMessage._id,
      });

      // 4️⃣ Payload
      const payload = {
        messageId: savedMessage._id,
        chatId: chat._id,
        fromUserId: socket.userId.toString(),
        message: savedMessage.message,
        createdAt: savedMessage.createdAt,
      };

      // 5️⃣ Emit to receiver
      io.to(toUserId.toString()).emit("receive-private-message", payload);

      // 6️⃣ Emit to sender (self update)
      io.to(socket.userId.toString()).emit(
        "receive-private-message",
        payload
      );
    } catch (error) {
      console.error("Message save error:", error);
      socket.emit("error", "Failed to send message");
    }
  });
};

export { registerPrivateChat };
