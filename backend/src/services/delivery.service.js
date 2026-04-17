import Message from "../models/message.model.js";
import { onlineUsers } from "../utils/onlineUsers.js";

// handle message delivery
const handleMessageDelivery = async (io, { message, toUserId, fromUserId }) => {
  try {
    const receiverId = toUserId.toString();
    const senderId = fromUserId.toString();

    // check if reciver online
    const isOnline = onlineUsers.has(receiverId);

    if (!isOnline) {
      return; // ❌ skip for now (future: queue / push notification)
    }

    // update db
    await Message.findByIdAndUpdate(message._id, {
      $addToSet: { deliveredTo: toUserId },
    });

    // emit delivery event
    io.to(senderId).emit("message-delivered", {
      messageId: message._id.toString(),
      userId: receiverId,
    });

  } catch (error) {
    console.error("Delivery error:", error.message);
  }
};

export { handleMessageDelivery };