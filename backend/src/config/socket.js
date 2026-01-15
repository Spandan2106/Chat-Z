const socketHandler = require("../sockets");

module.exports = (io) => {
  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socketHandler(io, socket);
  });
};
