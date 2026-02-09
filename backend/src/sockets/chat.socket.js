const User = require("../models/User.model");

// Track online users
const onlineUsers = new Map();

module.exports = (io, socket) => {
  // User connects and joins their personal room
  socket.on("setup", async (userData) => {
    if (!userData || !userData._id) return;

    socket.join(userData._id);
    onlineUsers.set(userData._id, {
      socketId: socket.id,
      username: userData.username,
      lastSeen: new Date()
    });

    // Broadcast online users list to all connected clients
    io.emit("online-users", Array.from(onlineUsers.keys()));
    
    console.log(`User ${userData.username} connected`);
  });

  // Handle legacy message sending
  socket.on("sendMessage", (data) => {
    io.to(data.receiverId).emit("receiveMessage", data);
  });

  // Handle user online status update
  socket.on("user-online", (userData) => {
    if (userData && userData._id) {
      onlineUsers.set(userData._id, {
        socketId: socket.id,
        username: userData.username,
        lastSeen: new Date()
      });
      io.emit("user-online", { 
        userId: userData._id,
        username: userData.username,
        lastSeen: new Date()
      });
      io.emit("online-users", Array.from(onlineUsers.keys()));
    }
  });

  // Handle user offline
  socket.on("user-offline", async (userData) => {
    if (userData && userData._id) {
      onlineUsers.delete(userData._id);
      
      // Update user's lastSeen in database
      try {
        await User.findByIdAndUpdate(userData._id, {
          lastSeen: new Date()
        });
      } catch (error) {
        console.error("Error updating lastSeen:", error);
      }

      io.emit("user-offline", { 
        userId: userData._id,
        lastSeen: new Date()
      });
      io.emit("online-users", Array.from(onlineUsers.keys()));
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    // Find and remove the user
    for (const [userId, userInfo] of onlineUsers.entries()) {
      if (userInfo.socketId === socket.id) {
        onlineUsers.delete(userId);
        io.emit("user-offline", { userId });
        io.emit("online-users", Array.from(onlineUsers.keys()));
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });

  // Check if user is online
  socket.on("is-user-online", (userId, callback) => {
    const isOnline = onlineUsers.has(userId);
    callback({ isOnline, lastSeen: onlineUsers.get(userId)?.lastSeen || null });
  });

  // Get online users
  socket.on("get-online-users", (callback) => {
    const users = Array.from(onlineUsers.entries()).map(([userId, info]) => ({
      userId,
      ...info
    }));
    callback(users);
  });
};
