const Message = require("../models/Message.model");
const Chat = require("../models/Chat.model");

module.exports = (io, socket) => {
  // User setup with socket mapping
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log(`User ${userData._id} connected with socket ${socket.id}`);
    socket.emit("connected");
  });

  // Join specific chat room
  socket.on("join-chat", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined chat room: ${room}`);
  });

  // Handle new message
  socket.on("send-message", async (data) => {
    try {
      // If the client already created the message via REST and sent the created message
      // (contains an _id), just broadcast it and update chat metadata.
      if (data && data._id) {
        const message = data;
        const chatId = message.chatId && (typeof message.chatId === 'object' ? message.chatId._id : message.chatId);
        console.log("Broadcasting existing message to room:", chatId);

        // Emit to all users in that chat room (including sender for confirmation)
        io.to(chatId).emit("message received", message);

        // Update chat's latest message pointer
        try {
          await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message._id,
            updatedAt: new Date()
          });
        } catch (err) {
          console.warn("Failed to update chat after existing message:", err.message);
        }

        // Notify chat members to update their chat list
        try {
          const chat = await Chat.findById(chatId).populate("users", "_id");
          if (chat && chat.users) {
            chat.users.forEach(user => {
              io.to(user._id.toString()).emit("chat-updated", {
                chatId: chatId,
                latestMessage: message,
                updatedAt: new Date()
              });
            });
          }
        } catch (err) {
          console.warn("Failed to notify users about chat update:", err.message);
        }

        return;
      }

      // Otherwise, create a new message record (socket-originated)
      const { content, chatId, sender, replyTo } = data;

      console.log("Received socket message to create:", { content, chatId, senderId: sender && sender._id });

      // Create message in database
      let message = await Message.create({
        sender: sender._id,
        content,
        chatId,
        replyTo: replyTo || null,
        status: "sent",
        createdAt: new Date()
      });

      console.log("Message created:", message._id);

      // Populate message with sender details
      await message.populate("sender", "username avatar email");
      await message.populate("chatId");

      // Update chat's latest message
      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: message._id,
        updatedAt: new Date()
      });

      console.log("Broadcasting newly created message to room:", chatId);

      // Emit to all users in that chat room (including sender for confirmation)
      io.to(chatId).emit("message received", message);

      // Mark as delivered
      await Message.findByIdAndUpdate(message._id, { status: "delivered" });

      // Notify all users in the chat to update their chat list (new message indicator)
      const chat = await Chat.findById(chatId).populate("users", "_id");
      if (chat && chat.users) {
        chat.users.forEach(user => {
          io.to(user._id.toString()).emit("chat-updated", {
            chatId: chatId,
            latestMessage: message,
            updatedAt: new Date()
          });
        });
      }

    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message", error: error.message });
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

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    socket.broadcast.emit("user-offline", { userId: socket.handshake.auth?.user?._id });
  });
};
