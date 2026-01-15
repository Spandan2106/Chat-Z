const Message = require("../models/Message.model");

exports.sendMessage = async (req, res) => {
  const message = await Message.create({
    chatId: req.body.chatId,
    sender: req.user.id,
    content: req.body.content,
    replyTo: req.body.replyTo || null
  });

  res.json(message);
};

exports.deleteChatHistory = async (req, res) => {
  await Message.deleteMany({ chatId: req.params.chatId });
  res.json({ message: "Chat history deleted" });
};
