import Message from "../models/message.model.js";
import Chat from "../models/chat.model.js";

// send private message
const sendPrivateMessageService = async ({
  fromUserId,
  toUserId,
  message,
  messageType,
  fileUrl,
}) => {
  // FIND OR CREATE CHAT
  let chat = await Chat.findOne({
    isGroupChat: false,
    members: { $all: [fromUserId, toUserId] },
  });

  if (!chat) {
    chat = await Chat.create({
      members: [fromUserId, toUserId],
    });
  }

  // MESSAGE TYPE
  let finalMessageType = "text";

  if (fileUrl) {
    if (messageType === "image") finalMessageType = "image";
    else if (messageType === "video") finalMessageType = "video";
    else finalMessageType = "file";
  }

  // SAVE MESSAGE
  const savedMessage = await Message.create({
    chatId: chat._id,
    senderId: fromUserId,
    message: message || "",
    messageType: finalMessageType,
    fileUrl: fileUrl || "",
    deliveredTo: [],
    seenBy: [],
  });

  // UPDATE CHAT
  await Chat.findByIdAndUpdate(chat._id, {
    lastMessage: savedMessage._id,
  });

  return {
    chat,
    message: savedMessage,
  };
};
// delete message
const deleteMessageService = async ({ messageId, userId, type }) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error("Message not found");

  // 🔒 Only sender
  if (message.senderId.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  // 🟢 DELETE FOR ME
  if (type === "delete-for-me") {
    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deletedFor: userId },
    });

    return {
      type: "delete-for-me",
      messageId,
      members: [userId], // only sender
    };
  }

  // 🔴 DELETE FOR EVERYONE
  if (type === "delete-for-everyone") {
    await Message.findByIdAndUpdate(messageId, {
      isDeleted: true,
      message: "This message was deleted",
      fileUrl: "",
    });

    const chat = await Chat.findById(message.chatId);

    return {
      type: "delete-for-everyone",
      messageId,
      members: chat.members,
    };
  }

  throw new Error("Invalid delete type");
};
// edit message
const editMessageService = async ({ messageId, userId, newMessage }) => {
  const message = await Message.findById(messageId);
  if (!message) throw new Error("Message not found");

  // 🔒 Only sender
  if (message.senderId.toString() !== userId.toString()) {
    throw new Error("Unauthorized");
  }

  if (message.isDeleted) {
    throw new Error("Cannot edit deleted message");
  }

  const updatedMessage = await Message.findByIdAndUpdate(
    messageId,
    {
      message: newMessage,
      isEdited: true,
    },
    { new: true }
  );

  const chat = await Chat.findById(message.chatId);

  return {
    messageId: updatedMessage._id.toString(),
    newMessage: updatedMessage.message,
    isEdited: true,
    members: chat.members,
  };
};
// mark as seen
const markAsSeenService = async ({ chatId, userId }) => {
  await Message.updateMany(
    {
      chatId,
      senderId: { $ne: userId },
    },
    {
      $addToSet: { seenBy: userId },
    }
  );

  const chat = await Chat.findById(chatId);

  return {
    chatId,
    seenBy: userId.toString(),
    members: chat.members,
  };
};
// 🔥 NEW: sync undelivered messages when user comes online
const syncUndeliveredMessagesService = async ({ userId }) => {
  // find messages where:
  // - this user is NOT sender
  // - user not in deliveredTo
  const messages = await Message.find({
    senderId: { $ne: userId },
    deliveredTo: { $ne: userId },
  }).select("_id senderId");

  if (!messages.length) return [];

  // update all messages
  await Message.updateMany(
    {
      _id: { $in: messages.map((m) => m._id) },
    },
    {
      $addToSet: { deliveredTo: userId },
    }
  );

  return messages.map((msg) => ({
    messageId: msg._id.toString(),
    senderId: msg.senderId.toString(),
  }));
};

export {
  sendPrivateMessageService,
  deleteMessageService,
  editMessageService,
  markAsSeenService,
  syncUndeliveredMessagesService
};
