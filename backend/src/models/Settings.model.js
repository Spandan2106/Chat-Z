const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    messageNotifications: { type: Boolean, default: true },
    friendRequestNotifications: { type: Boolean, default: true }
  },
  privacy: {
    profileVisibility: { type: String, enum: ['public', 'friends', 'private'], default: 'friends' },
    showOnlineStatus: { type: Boolean, default: true },
    allowFriendRequests: { type: Boolean, default: true }
  },
  security: {
    twoFactorAuth: { type: Boolean, default: false },
    loginAlerts: { type: Boolean, default: true },
    sessionTimeout: { type: Number, default: 30 } // minutes
  },
  chatHistory: {
    saveHistory: { type: Boolean, default: true },
    autoDeleteAfter: { type: Number, default: 365 } // days
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
