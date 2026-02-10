const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  type: { type: String, enum: ["text", "image", "file", "audio", "video"], default: "text" },

  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent"
  },

  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isDeleted: { type: Boolean, default: false },
  isForwarded: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);