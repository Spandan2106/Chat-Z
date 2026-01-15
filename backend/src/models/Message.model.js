const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
