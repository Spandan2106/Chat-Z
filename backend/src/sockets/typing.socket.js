module.exports = (io, socket) => {
  socket.on("typing", ({ receiverId }) => {
    socket.to(receiverId).emit("typing");
  });

  socket.on("stop-typing", ({ receiverId }) => {
    socket.to(receiverId).emit("stop-typing");
  });
};
