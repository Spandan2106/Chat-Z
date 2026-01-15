const bcrypt = require("bcrypt");
const User = require("../models/User.model");
const generateToken = require("../utils/generateToken");

exports.register = async (req, res) => {
  const { username, email, password, publicKey } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    email,
    password: hashed,
    publicKey
  });

  res.json({ token: generateToken(user._id) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  res.json({ token: generateToken(user._id) });
};
