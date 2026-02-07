const Settings = require('../models/Settings.model');

// Get user settings
const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    let settings = await Settings.findOne({ userId });

    if (!settings) {
      // Create default settings if not exist
      settings = new Settings({ userId });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update notifications
const updateNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notifications } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { userId },
      { notifications },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update privacy
const updatePrivacy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { privacy } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { userId },
      { privacy },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update security
const updateSecurity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { security } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { userId },
      { security },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update chat history
const updateChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatHistory } = req.body;

    const settings = await Settings.findOneAndUpdate(
      { userId },
      { chatHistory },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSettings,
  updateNotifications,
  updatePrivacy,
  updateSecurity,
  updateChatHistory
};
