// backend/src/models/Status.model.js
const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ['text', 'image'], default: 'text' },
  content: { type: String, required: true },
  backgroundColor: { type: String, default: '#000000' }, // For text statuses
  viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  expiresAt: { type: Date, default: () => new Date(Date.now() + 24*60*60*1000), index: { expires: '1s' } },
}, { timestamps: true });

const Status = mongoose.model("Status", statusSchema);

module.exports = Status;
