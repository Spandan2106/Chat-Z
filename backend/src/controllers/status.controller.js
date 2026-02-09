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

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const statuses = await Status.find({
      user: { $in: contactIds },
      createdAt: { $gte: twentyFourHoursAgo }
    })
      .populate('user', 'username avatar')
      .populate('viewers', 'username avatar')
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

exports.deleteStatus = async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ error: "Status not found" });
    
    if (status.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Not authorized to delete this status" });
    }

    await Status.findByIdAndDelete(req.params.id);
    res.json({ message: "Status deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.viewStatus = async (req, res) => {
  try {
    const status = await Status.findByIdAndUpdate(req.params.id, { $addToSet: { viewers: req.user._id } }, { new: true });
    if (!status) return res.status(404).json({ error: "Status not found" });
    res.json(status);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
