import { registerPrivateChat } from "./privateChat.handler.js";
import { registerOnlineUsers } from "./onlineUsers.handler.js";
import { onlineUsers } from "../../utils/onlineUsers.js";
import User from "../../models/auth.model.js";

const handleConnection = (io, socket) => {
  // handling error if occure
  socket.on("error", (err) => {
    console.error("Socket error:", err.message);
  });

  const userId = socket.userId.toString();

  socket.join(userId);

  // store online user while user is connected
  onlineUsers.set(userId, socket.id);

  console.log(`User ${userId} connected`);

  socket.broadcast.emit("user-online", { userId });

  registerPrivateChat(io, socket);
  registerOnlineUsers(io, socket);

  socket.on("disconnect", async() => {
    // deleting user after disconnect
    onlineUsers.delete(userId);

    // save last seen
    const lastSeen = new Date();
    await User.findByIdAndUpdate(userId, {lastSeen});

    // notify others
    socket.broadcast.emit("user-offline",{
      userId,
      lastSeen
    });
    console.log(`User ${userId} disconnected`);
  });
};

export { handleConnection };
