const registerTyping = (io, socket) => {
  socket.on("typing-start", ({ toUserId }) => {
    if (!toUserId) return;

    io.to(toUserId.toString()).emit("user-typing", {
      userId: socket.userId.toString(),
    });
  });

  socket.on("typing-stop", ({ toUserId }) => {
    if (!toUserId) return;

    io.to(toUserId.toString()).emit("user-stop-typing", {
      userId: socket.userId.toString(),
    });
  });
};

export { registerTyping };