const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: "" },
  isAdmin: { type: Boolean, default: false },
  about: { type: String, default: "Hey there! I am using Chat_Z." },
  country: { type: String, default: "" },
  blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  archivedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  mutedChats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
  starredMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  lastSeen: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);