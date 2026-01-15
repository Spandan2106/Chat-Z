module.exports = (io, socket) => {
  require("./message.socket")(io, socket);
  require("./typing.socket")(io, socket);
};
