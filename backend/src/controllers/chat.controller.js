const Chat = require("../models/Chat.model");

exports.createChat = async (req, res) => {
  const chat = await Chat.create({
    participants: [req.user.id, req.body.userId]
  });
  res.json(chat);
};
