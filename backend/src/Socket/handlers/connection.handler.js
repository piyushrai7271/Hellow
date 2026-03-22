import { registerPrivateChat } from "./privateChat.handler.js";

const handleConnection = (io, socket) => {
  const userId = socket.userId.toString();

  socket.join(userId);

  console.log(`User ${userId} connected and joined room`);

  registerPrivateChat(io, socket);

  socket.on("disconnect", () => {
    console.log(`User ${userId} disconnected`);
  });
};

export { handleConnection };
