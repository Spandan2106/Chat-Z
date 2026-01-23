const Message = require("../models/message.model");
const User = require("../models/user.model");
const Chat = require("../models/Chat.model");

exports.sendMediaMessage = async (req, res) => {
  try {
    const { chatId } = req.body;
    let message = await Message.create({
      sender: req.user._id,
      content: req.file.path,
      chatId: chatId,
      type: "image"
    });
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chatId");
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  const { content, chatId, replyTo } = req.body;

  if (!content || !chatId) {
    return res.sendStatus(400);
  }

  try {
    const messageData = {
      sender: req.user._id,
      content: content,
      chatId: chatId,
      type: "text"
    };

    if (replyTo) messageData.replyTo = replyTo;
    let message = await Message.create(messageData);

    message = await message.populate("sender", "username avatar");
    message = await message.populate("chatId");
    message = await message.populate("replyTo");
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
    const messages = await Message.find({ chatId: req.params.chatId })
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
  users.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
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
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "username avatar email",
        });
        res.status(200).send(results);
      });
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
