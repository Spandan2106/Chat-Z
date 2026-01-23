module.exports = (io, socket) => {
  // Typing indicator
  socket.on("typing", (data) => {
    const { chatId, username } = data;
    if (socket.handshake.auth?.user && chatId) {
      socket.broadcast.to(chatId).emit("user-typing", { 
        username: socket.handshake.auth.user.username,
        userId: socket.handshake.auth.user._id,
        chatId 
      });
    }
  });

  // Stop typing indicator
  socket.on("stop-typing", (data) => {
    const { chatId } = data;
    if (socket.handshake.auth?.user && chatId) {
      socket.broadcast.to(chatId).emit("stop-typing", { 
        userId: socket.handshake.auth.user._id,
        chatId 
      });
    }
  });

  // User online status
  socket.on("user-online", (userData) => {
    io.emit("user-online", { 
      userId: userData._id,
      username: userData.username 
    });
  });

  // User offline status
  socket.on("user-offline", (userData) => {
    io.emit("user-offline", { userId: userData._id });
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    // Get user from socket handshake
    if (socket.handshake.auth?.user) {
      io.emit("user-offline", { userId: socket.handshake.auth.user._id });
    }
  });
};
