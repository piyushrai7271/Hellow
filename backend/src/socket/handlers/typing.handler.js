import {
  emitTypingStart,
  emitTypingStop,
} from "../../services/event.service.js";

const registerTyping = (io, socket) => {
  socket.on("typing-start", ({ toUserId }) => {
    if (!toUserId) return;

    emitTypingStart(io, {
      toUserId,
      userId: socket.userId.toString(),
    });
  });

  socket.on("typing-stop", ({ toUserId }) => {
    if (!toUserId) return;

    emitTypingStop(io, {
      toUserId,
      userId: socket.userId.toString(),
    });
  });
};

export { registerTyping };