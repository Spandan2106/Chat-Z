// backend/src/controllers/status.controller.js
const Status = require('../models/Status.model');
const User = require('../models/user.model');

exports.createStatus = async (req, res) => {
  const { type, content, backgroundColor } = req.body;
  try {
    const status = await Status.create({
      user: req.user._id,
      type,
      content,
      backgroundColor,
    });
    res.status(201).json(status);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getStatuses = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id).select('contacts');
    const contactIds = currentUser.contacts;
    contactIds.push(req.user._id); // Include own statuses

    const statuses = await Status.find({ user: { $in: contactIds } })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 });

    // Group statuses by user
    const groupedStatuses = statuses.reduce((acc, status) => {
      const userId = status.user._id.toString();
      if (!acc[userId]) {
        acc[userId] = { user: status.user, statuses: [] };
      }
      acc[userId].statuses.push(status);
      return acc;
    }, {});

    res.json(Object.values(groupedStatuses));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
