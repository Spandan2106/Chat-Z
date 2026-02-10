const User = require("../models/User.model");
const Message = require("../models/Message.model");
const Chat = require("../models/Chat.model");
const Ticket = require("../models/Ticket.model");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 0;
    const skip = (page - 1) * limit;
    const escapeRegex = (text) => {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    let query = {};

    if (req.query.search) {
      query.$or = [
        { username: { $regex: escapeRegex(req.query.search.trim()), $options: "i" } },
        { email: { $regex: escapeRegex(req.query.search.trim()), $options: "i" } },
      ];
    }

    if (req.query.country) {
      query.country = req.query.country;
    }

    if (req.user && !req.user.isAdmin) {
      // Non-admins: Hide other admins (except Support), hide self
      query = {
        $and: [
          query,
          { _id: { $ne: req.user._id } },
          {
            $or: [
              { isAdmin: { $ne: true } },
              { email: "customercare@gmail.com" }
            ]
          }
        ]
      };
    }

    let usersQuery = User.find(query).select("-password").select("username email avatar country publicKey");

    if (limit > 0) {
      usersQuery = usersQuery.skip(skip).limit(limit);
    }

    const users = await usersQuery;
    res.send(users);
  } catch (err) {
    console.error("Error in getUsers:", err);
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

exports.authSupport = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email === "customercare@gmail.com" && password === "####123") {
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          username: "Customer Care",
          email: "customercare@gmail.com",
          password: "####123",
          isAdmin: true, // Staff privileges
          avatar: "https://icon-library.com/images/support-icon/support-icon-10.jpg"
        });
      } else if (!user.isAdmin) {
          user.isAdmin = true;
          await user.save();
      }

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: "Invalid Support Credentials" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getContacts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("contacts", "-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.contacts || []);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.removeContact = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { contacts: userId } },
      { new: true }
    ).populate("contacts", "-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
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
    const user = await User.findById(req.params.id);
    if (user && user.email === "admin@gmail.com") {
      return res.status(400).json({ error: "Cannot delete the main admin account" });
    }
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

exports.reportUser = async (req, res) => {
  try {
    // In a real app, save this to a Reports collection
    console.log(`Report received from ${req.user._id} against ${req.body.targetId}`);
    res.status(200).json({ message: "Report submitted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.toggleStarMessage = async (req, res) => {
  const { messageId } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (user.starredMessages.includes(messageId)) {
      user.starredMessages = user.starredMessages.filter(id => id.toString() !== messageId);
    } else {
      user.starredMessages.push(messageId);
    }
    await user.save();
    res.json(user.starredMessages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.uploadPicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const user = await User.findByIdAndUpdate(req.user._id, { avatar: req.file.path.replace(/\\/g, "/") }, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTicket = async (req, res) => {
  const { subject, description } = req.body;
  try {
    const ticket = await Ticket.create({
      user: req.user._id,
      subject,
      description,
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTickets = async (req, res) => {
  try {
    let tickets;
    if (req.user.isAdmin || req.user.email === "customercare@gmail.com") {
      tickets = await Ticket.find().populate("user", "username email").sort({ createdAt: -1 });
    } else {
      tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
    }
    res.json(tickets);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.replyTicket = async (req, res) => {
  const { ticketId, message } = req.body;
  try {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });

    ticket.responses.push({ sender: req.user._id, message });
    if (!req.user.isAdmin && req.user.email !== "customercare@gmail.com") {
      ticket.status = "Open";
    }
    await ticket.save();
    
    const updatedTicket = await Ticket.findById(ticketId)
      .populate("user", "username email")
      .populate("responses.sender", "username email");
      
    res.json(updatedTicket);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.authAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (email === "admin@gmail.com" && password === "admin2019usaNY2026@$") {
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          username: "Admin",
          email: "admin@gmail.com",
          password: "admin2019usaNY2026@$",
          isAdmin: true,
          avatar: "https://icon-library.com/images/admin-icon/admin-icon-12.jpg"
        });
      } else if (!user.isAdmin) {
          user.isAdmin = true;
          await user.save();
      }

      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ error: "Invalid Admin Credentials" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (user && user.email === "admin@gmail.com") {
      return res.status(400).json({ error: "Cannot delete the main admin account" });
    }
    // Delete all messages sent by the user
    await Message.deleteMany({ sender: userId });
    // Remove user from all chats
    await Chat.updateMany({ users: userId }, { $pull: { users: userId } });
    await User.findByIdAndDelete(userId);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.matchPassword && await user.matchPassword(currentPassword)) {
      user.password = newPassword;
      await user.save();
      res.json({ message: "Password updated successfully" });
    } else {
      res.status(400).json({ error: "Invalid current password" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
