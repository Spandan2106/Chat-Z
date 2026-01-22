const Message = require("../models/Message.model");

module.exports = (io, socket) => {
  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chatId;
    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageReceived.sender._id) return;
      socket.in(user._id).emit("message received", newMessageReceived);
    });
  });

  socket.on("send-message", async (data) => {
    const message = await Message.create(data);

    io.to(data.receiverId).emit("receive-message", message);

    // delivered
    await Message.findByIdAndUpdate(message._id, { status: "delivered" });
  });

  socket.on("seen-message", async ({ messageId }) => {
    await Message.findByIdAndUpdate(messageId, { status: "seen" });
    io.emit("message-seen", { messageId });
  });
};
