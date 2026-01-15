const User = require("../models/User.model");

exports.deleteAccount = async (req, res) => {
  await User.findByIdAndDelete(req.user.id);
  res.json({ message: "Account deleted" });
};

exports.blockUser = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, {
    $addToSet: { blockedUsers: req.params.userId }
  });
  res.json({ message: "User blocked" });
};
