import { registerPrivateChat } from "./privateChat.handler.js";
import { registerTyping } from "./typing.handler.js";
import { registerSeen } from "./seen.handler.js";
import { registerOnlineUsers } from "./onlineUsers.handler.js";
import { onlineUsers } from "../../utils/onlineUsers.js";
import { registerDeleteMessage } from "./delete.handler.js";
import { registerEditMessage } from "./edit.handler.js";
import User from "../../models/auth.model.js";

const handleConnection = (io, socket) => {
  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
  });

  const userId = socket.userId.toString();

  socket.join(userId);

  // Store online user
  onlineUsers.set(userId, socket.id);

  console.log(`User ${userId} connected`);

  socket.broadcast.emit("user-online", { userId });

  // Register features
  registerPrivateChat(io, socket);
  registerTyping(io, socket);
  registerSeen(io, socket);
  registerOnlineUsers(io, socket);
  registerDeleteMessage(io, socket);
  registerEditMessage(io, socket);

  socket.on("disconnect", async () => {
    onlineUsers.delete(userId);

    const lastSeen = new Date();
    await User.findByIdAndUpdate(userId, { lastSeen });

    socket.broadcast.emit("user-offline", {
      userId,
      lastSeen,
    });

    console.log(`User ${userId} disconnected`);
  });
};

export { handleConnection };
