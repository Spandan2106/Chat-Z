module.exports = (io, socket) => {
  socket.on("send-message", (data) => {
    io.to(data.receiverId).emit("receive-message", data);
  });
};
