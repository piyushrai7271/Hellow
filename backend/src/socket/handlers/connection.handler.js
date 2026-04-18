import { registerPrivateChat } from "./privateChat.handler.js";
import { registerTyping } from "./typing.handler.js";
import { registerSeen } from "./seen.handler.js";
import { registerOnlineUsers } from "./onlineUsers.handler.js";
import { onlineUsers } from "../../utils/onlineUsers.js";
import { registerDeleteMessage } from "./delete.handler.js";
import { registerEditMessage } from "./edit.handler.js";
import User from "../../models/auth.model.js";
import { EVENTS } from "../../config/event.js";
import {
  emitUserOnline,
  emitUserOffline,
} from "../../services/event.service.js";

const handleConnection = (io, socket) => {
  // ✅ Handle custom socket errors safely
  socket.on(EVENTS.ERROR, (err) => {
    console.error("Socket error:", err?.message || err);
  });

  const userId = socket.userId.toString();

  // ✅ Join personal room
  socket.join(userId);

  // ✅ Store online user
  onlineUsers.set(userId, socket.id);

  console.log(`User ${userId} connected`);

  // ✅ Emit user online
  emitUserOnline(socket, userId);

  // ✅ Register all feature handlers
  registerPrivateChat(io, socket);
  registerTyping(io, socket);
  registerSeen(io, socket);
  registerOnlineUsers(io, socket);
  registerDeleteMessage(io, socket);
  registerEditMessage(io, socket);

  // ✅ Handle disconnect safely
  socket.on("disconnect", async () => {
    try {
      onlineUsers.delete(userId);

      const lastSeen = new Date();

      // ✅ DB update wrapped in try-catch
      await User.findByIdAndUpdate(userId, { lastSeen });

      // ✅ Emit offline event
      emitUserOffline(socket, { userId, lastSeen });

      console.log(`User ${userId} disconnected`);
    } catch (error) {
      console.error("Disconnect error:", error?.message || error);
    }
  });
};

export { handleConnection };