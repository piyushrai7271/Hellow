import Message from "../models/message.model.js";
import { onlineUsers } from "../utils/onlineUsers.js";

const handleMessageDelivery = async ({ message, toUserId }) => {
  const receiverId = toUserId.toString();

  const isOnline = onlineUsers.has(receiverId);

  if (!isOnline) return false;

  await Message.findByIdAndUpdate(message._id, {
    $addToSet: { deliveredTo: toUserId },
  });

  return true; // 👈 important
};

export { handleMessageDelivery };