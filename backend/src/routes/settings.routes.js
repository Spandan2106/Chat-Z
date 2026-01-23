const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth.middleware');
const {
  getSettings,
  updateNotifications,
  updatePrivacy,
  updateSecurity,
  updateChatHistory
} = require('../controllers/settings.controller');

// Get user settings
router.get('/', auth, getSettings);

// Update notifications
router.put('/notifications', auth, updateNotifications);

// Update privacy
router.put('/privacy', auth, updatePrivacy);

// Update security
router.put('/security', auth, updateSecurity);

// Update chat history
router.put('/chat-history', auth, updateChatHistory);

module.exports = router;
