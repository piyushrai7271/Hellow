import { onlineUsers } from "../../utils/onlineUsers.js";
import User from "../../models/auth.model.js";

const registerOnlineUsers = (io, socket) => {
  socket.on("check-user-status", async({userId}) => {

    if (!userId) {
      return socket.emit("error", "UserId missing");
    }

    // check if online
    if (onlineUsers.has(userId.toString())) {
      return socket.emit("user-status", {
        userId,
        isOnline: true,
      });
    }

    // else get last seen
    const user = await User.findById(userId).select("lastSeen");

    socket.emit("user-status", {
      userId,
      isOnline: false,
      lastSeen: user?.lastSeen,
    });
  });
};

export { registerOnlineUsers };
