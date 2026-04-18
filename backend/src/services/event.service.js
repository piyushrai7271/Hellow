import { EVENTS } from "../config/event.js";


// private message
const emitPrivateMessage = (io, { toUserId, fromUserId, payload }) => {
  io.to(toUserId.toString()).emit(EVENTS.RECEIVE_PRIVATE_MESSAGE, payload);
  io.to(fromUserId.toString()).emit(EVENTS.RECEIVE_PRIVATE_MESSAGE, payload);
};


// delivery
const emitMessageDelivered = (io, { fromUserId, messageId, toUserId }) => {
  io.to(fromUserId.toString()).emit(EVENTS.MESSAGE_DELIVERED, {
    messageId,
    userId: toUserId.toString(),
  });
};


// delete

const emitMessageDeleted = (io, { members, messageId, type }) => {
  members.forEach((id) => {
    io.to(id.toString()).emit(EVENTS.MESSAGE_DELETED, {
      messageId,
      type,
    });
  });
};


// edit

const emitMessageEdited = (io, { members, messageId, newMessage, isEdited }) => {
  members.forEach((id) => {
    io.to(id.toString()).emit(EVENTS.MESSAGE_EDITED, {
      messageId,
      newMessage,
      isEdited,
    });
  });
};


// seen
const emitMessagesSeen = (io, { members, chatId, seenBy }) => {
  members.forEach((id) => {
    if (id.toString() !== seenBy.toString()) {
      io.to(id.toString()).emit(EVENTS.MESSAGES_SEEN, {
        chatId,
        seenBy,
      });
    }
  });
};

// typing
const emitTypingStart = (io, { toUserId, userId }) => {
  io.to(toUserId.toString()).emit(EVENTS.USER_TYPING, { userId });
};

const emitTypingStop = (io, { toUserId, userId }) => {
  io.to(toUserId.toString()).emit(EVENTS.USER_STOP_TYPING, { userId });
};


// ONLINE / OFFLINE
const emitUserOnline = (socket, userId) => {
  socket.broadcast.emit(EVENTS.USER_ONLINE, { userId });
};

const emitUserOffline = (socket, { userId, lastSeen }) => {
  socket.broadcast.emit(EVENTS.USER_OFFLINE, { userId, lastSeen });
};

export {
  emitPrivateMessage,
  emitMessageDelivered,
  emitMessageDeleted,
  emitMessageEdited,
  emitMessagesSeen,
  emitTypingStart,
  emitTypingStop,
  emitUserOnline,
  emitUserOffline,
};