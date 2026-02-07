module.exports = (io, socket) => {
  // Typing indicator
  socket.on("typing", (data) => {
    try {
      const { chatId } = data;
      const user = socket.handshake.auth?.user;
      
      if (!user || !user._id || !chatId) {
        console.error("Invalid typing data:", { user, chatId });
        return;
      }
      
      console.log(`User ${user.username} typing in chat ${chatId}`);
      
      // Broadcast to all users in the chat room (excluding sender)
      socket.to(chatId).emit("user-typing", {
        username: user.username,
        userId: user._id,
        chatId: chatId
      });
    } catch (error) {
      console.error("Error in typing event:", error);
    }
  });

  // Stop typing indicator
  socket.on("stop-typing", (data) => {
    try {
      const { chatId } = data;
      const user = socket.handshake.auth?.user;
      
      if (!user || !user._id || !chatId) {
        console.error("Invalid stop-typing data:", { user, chatId });
        return;
      }
      
      console.log(`User ${user.username} stopped typing in chat ${chatId}`);
      
      // Broadcast to all users in the chat room
      socket.to(chatId).emit("stop-typing", {
        userId: user._id,
        chatId: chatId
      });
    } catch (error) {
      console.error("Error in stop-typing event:", error);
    }
  });

  // User online status
  socket.on("user-online", (userData) => {
    if (userData && userData._id) {
      console.log("User online:", userData._id);
      io.emit("user-online", {
        userId: userData._id,
        username: userData.username
      });
    }
  });

  // User offline status
  socket.on("user-offline", (userData) => {
    if (userData && userData._id) {
      console.log("User offline:", userData._id);
      io.emit("user-offline", { userId: userData._id });
    }
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    const user = socket.handshake.auth?.user;
    if (user && user._id) {
      console.log("User disconnected:", user._id);
      io.emit("user-offline", { userId: user._id });
    }
  });
};

