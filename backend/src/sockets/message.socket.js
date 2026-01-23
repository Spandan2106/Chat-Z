const Message = require("../models/message.model");
const Chat = require("../models/Chat.model");

module.exports = (io, socket) => {
  // User setup with socket mapping
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  // Join specific chat room
  socket.on("join-chat", (room) => {
    socket.join(room);
    console.log(`User joined chat: ${room}`);
  });

  // Handle new message
  socket.on("send-message", async (data) => {
    try {
      const { content, chatId, sender, replyTo } = data;

      const message = await Message.create({
        sender: sender._id,
        content,
        chatId,
        replyTo: replyTo || null,
        status: "sent",
        createdAt: new Date()
      });

      // Populate message with sender details
      await message.populate("sender", "username avatar email");
      await message.populate("chatId");

      // Update chat's latest message
      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: message._id,
        updatedAt: new Date()
      });

      // Emit to all users in that chat room
      io.to(chatId).emit("message received", message);

      // Mark as delivered
      await Message.findByIdAndUpdate(message._id, { status: "delivered" });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Mark message as seen
  socket.on("seen-message", async ({ messageId, chatId }) => {
    try {
      const message = await Message.findByIdAndUpdate(
        messageId,
        { status: "seen" },
        { new: true }
      );
      
      // Emit to all users in the chat
      io.to(chatId).emit("message-seen", { messageId });
    } catch (error) {
      console.error("Error marking message as seen:", error);
    }
  });

  // Handle old message format for compatibility
  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chatId;
    if (!chat || !chat.users) return;

    chat.users.forEach((user) => {
      if (user._id === newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    socket.broadcast.emit("user-offline", { userId: socket.handshake.auth?.userId });
  });
};

