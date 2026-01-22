const User = require("../models/User.model");

exports.getUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { username: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    // If admin, return all users; else return users excluding current user
    const query = req.user.isAdmin ? keyword : { ...keyword, _id: { $ne: req.user._id } };

    const users = await User.find(query).select("-password");
    res.send(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addContact = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { contacts: userId } },
      { new: true }
    ).populate("contacts", "-password");
    res.json(user.contacts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("contacts", "-password");
    res.json(user.contacts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $addToSet: { blockedUsers: req.body.userId } }, { new: true });
    res.json(user.blockedUsers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, { $pull: { blockedUsers: req.body.userId } }, { new: true });
    res.json(user.blockedUsers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBlockedUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("blockedUsers", "username avatar email");
    res.json(user.blockedUsers);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.toggleMute = async (req, res) => {
  const { chatId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user.mutedChats.includes(chatId)) {
      user.mutedChats = user.mutedChats.filter(id => id.toString() !== chatId);
    } else {
      user.mutedChats.push(chatId);
    }
    await user.save();
    res.json(user.mutedChats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};