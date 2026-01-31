const Message = require("../models/message.model");
const User = require("../models/user.model");
const Chat = require("../models/Chat.model");

exports.sendMediaMessage = async (req, res) => {
  try {
    const { chatId } = req.body;
    const contentPath = req.file.path.replace(/\\/g, "/");
    let message = await Message.create({
      sender: req.user._id,
      content: contentPath,
      chatId: chatId,
      type: req.file.mimetype.startsWith("audio") ? "audio" : "image"
    });
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chatId");
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;
  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404).send("Chat Not Found");
    } else {
      res.json(updatedChat);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const added = await Chat.findByIdAndUpdate(
      chatId,
      { $push: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(404).send("Chat Not Found");
    } else {
      res.json(added);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res.status(404).send("Chat Not Found");
    } else {
      res.json(removed);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.sendMessage = async (req, res) => {
  const { content, chatId, replyTo, isForwarded, type } = req.body;

  if (!content || !chatId) {
    return res.sendStatus(400);
  }

  try {
    const messageData = {
      sender: req.user._id,
      content: content,
      chatId: chatId,
      type: type || "text",
      isForwarded: isForwarded || false
    };

    if (replyTo) messageData.replyTo = replyTo;
    let message = await Message.create(messageData);

    message = await message.populate("sender", "username avatar");
    message = await message.populate("chatId");
    if (message.replyTo) {
      message = await message.populate({
        path: 'replyTo',
        populate: { path: 'sender', select: 'username' }
      });
    }
    message = await User.populate(message, {
      path: "chatId.users",
      select: "username avatar email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.allMessages = async (req, res) => {
  try {
    const messages = await Message.find({ 
      chatId: req.params.chatId,
      deletedFor: { $ne: req.user._id } 
    })
      .populate("sender", "username avatar email")
      .populate("chatId");
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.sendStatus(400);

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "username avatar email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
    try {
      const createdChat = await Chat.create(chatData);
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password");
      res.status(200).send(FullChat);
    } catch (error) {
      res.status(400).send(error.message);
    }
  }
};

exports.createGroupChat = async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please Fill all the fields" });
  }
  var users = JSON.parse(req.body.users);
  if (users.length < 1) {
    return res.status(400).send("At least 1 user is required to form a group chat");
  }
  users.push(req.user._id);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.fetchChats = async (req, res) => {
  try {
    if (!req.user) return res.status(400).send("User not authenticated");

    let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    results = await User.populate(results, {
      path: "latestMessage.sender",
      select: "username avatar email",
    });
    res.status(200).send(results);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.deleteAllChats = async (req, res) => {
  try {
    // Delete all 1-on-1 chats where the user is a participant
    // Note: For a real production app, you might want to just "hide" them or clear messages instead of deleting the chat document.
    await Chat.deleteMany({ users: { $elemMatch: { $eq: req.user._id } }, isGroupChat: false });
    res.status(200).json({ message: "All chats deleted successfully" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.deleteChatHistory = async (req, res) => {
  try {
    await Message.deleteMany({ chatId: req.params.chatId });
    res.status(200).json({ message: "Chat history cleared" });
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.deleteForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Check if user is part of the chat
    const chat = await Chat.findById(message.chatId);
    if (!chat.users.includes(userId)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Add user to deletedFor array if not already there
    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    res.json({ message: "Message deleted for you" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Only sender can delete for everyone
    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only sender can delete for everyone" });
    }

    message.content = "This message was deleted";
    message.type = "text";
    message.isDeleted = true;
    await message.save();
    
    await message.populate("sender", "username avatar email");

    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.markMessagesAsRead = async (req, res) => {
  const { chatId } = req.body;
  const userId = req.user._id;
  try {
    await Message.updateMany({ chatId: chatId, sender: { $ne: userId }, status: { $ne: "seen" } }, { $set: { status: "seen" }, $addToSet: { readBy: userId } });
    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
