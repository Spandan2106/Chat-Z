const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {

    socket.on("join", (userId) => {
      onlineUsers.set(userId, socket.id);
      io.emit("online-users", Array.from(onlineUsers.keys()));
      socket.userId = userId;
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit("last-seen", {
          userId: socket.userId,
          time: new Date()
        });
      }
    });
  });
};
