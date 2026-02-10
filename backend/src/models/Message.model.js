const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // Store encrypted content
  content: String,
  content: String,
  type: { type: String, enum: ["text", "image", "file"], default: "text" },

  status: {
    type: String,
    enum: ["sent", "delivered", "seen"],
    default: "sent"
  },

  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  deletedFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
}, { timestamps: true });

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);