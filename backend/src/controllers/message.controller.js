const Message = require("../models/Message.model");
const User = require("../models/User.model");
const Chat = require("../models/Chat.model");

exports.sendMediaMessage = async (req, res) => {
  try {
    const { chatId } = req.body;
    const contentPath = req.file.path.replace(/\\/g, "/");
    
    let type = "file";
    if (req.file.mimetype.startsWith("image")) type = "image";
    else if (req.file.mimetype.startsWith("audio")) type = "audio";
    else if (req.file.mimetype.startsWith("video")) type = "video";

    let message = await Message.create({
      sender: req.user._id,
      content: contentPath,
      chatId: chatId,
      type: type
    });
    message = await message.populate("sender", "username avatar");
    message = await message.populate("chatId");
    message = await User.populate(message, {
      path: "chatId.users",
      select: "username avatar email",
    });
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
      // Notify all users in the group of the name change
      const io = req.app.get('io');
      updatedChat.users.forEach(user => {
        io.to(user._id.toString()).emit('chat-group-update', updatedChat);
      });

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
      // Notify all users in the group that a member was added
      const io = req.app.get('io');
      added.users.forEach(user => {
        io.to(user._id.toString()).emit('chat-group-update', added);
      });

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
      const io = req.app.get('io');
      // Notify remaining users of the change
      removed.users.forEach(user => {
        io.to(user._id.toString()).emit('chat-group-update', removed);
      });
      // Notify the removed user so their UI can update
      io.to(userId.toString()).emit('chat-group-update', removed);

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
    let message = await Message.create({
      sender: req.user._id,
      content: content,
      chatId: chatId,
      type: type || "text",
      isForwarded: isForwarded || false,
      replyTo: replyTo || undefined
    });

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
    .populate("sender", "username avatar email publicKey")
    .populate("chatId")
    .populate({
      path: 'replyTo',
      populate: { path: 'sender', select: 'username' }
    });

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
  console.log("Create group request body:", req.body);
  console.log("User:", req.user);

  if (!req.body.users || !req.body.name) {
    console.log("Missing fields:", { users: req.body.users, name: req.body.name });
    return res.status(400).send({ message: "Please Fill all the fields" });
  }

  try {
    // Robust parsing for users array
    let users;
    try {
      users = typeof req.body.users === 'string' ? JSON.parse(req.body.users) : req.body.users;
    } catch (e) {
      return res.status(400).send("Invalid users data format");
    }
    
    console.log("Parsed users:", users);

    if (!users || users.length < 1) {
      return res.status(400).send("At least 1 user is required to form a group chat");
    }

    // Ensure all IDs are strings to prevent duplicates and ensure current user is added
    const allUserIds = users.map(u => String(u));
    allUserIds.push(String(req.user._id));
    const uniqueUsers = [...new Set(allUserIds)];

    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: uniqueUsers,
      isGroupChat: true,
      groupAdmin: req.user._id,
    });

    console.log("Group chat created:", groupChat);

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    console.log("Full group chat:", fullGroupChat);

    // Notify all group members about the new group
    const io = req.app.get('io');
    uniqueUsers.forEach(userId => {
      console.log("Notifying user:", userId);
      io.to(userId.toString()).emit('chat-group-update', fullGroupChat);
    });

    res.status(200).json(fullGroupChat);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(400).send(error.message);
  }
};

exports.fetchChats = async (req, res) => {
  try {
    if (!req.user) return res.status(400).send("User not authenticated");

    // Use a direct query on the array of user IDs. This is more efficient and
    // reliable for finding chats where the user is a member.
    let results = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    results = await User.populate(results, {
      path: "latestMessage.sender",
      select: "username avatar email",
    });

    // Add unread counts
    const chatsWithCount = await Promise.all(results.map(async (chat) => {
      const unreadCount = await Message.countDocuments({
        chatId: chat._id,
        sender: { $ne: req.user._id },
        readBy: { $ne: req.user._id }
      });
      return { ...chat.toObject(), unreadCount };
    }));

    res.status(200).send(chatsWithCount);
  } catch (error) {
    res.status(400).send(error.message);
  }
};

exports.searchGroups = async (req, res) => {
  try {
    const escapeRegex = (text) => {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    };

    const keyword = req.query.search
      ? {
          chatName: { $regex: escapeRegex(req.query.search), $options: "i" },
        }
      : {};

    const groups = await Chat.find({
      isGroupChat: true,
      ...keyword,
      users: { $ne: req.user._id } // Exclude groups user is already in
    })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

    res.json(groups);
  } catch (error) {
    res.status(400).json({ error: error.message });
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

exports.deleteGroup = async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user._id;

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is admin
    if (chat.groupAdmin.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the admin can delete the group" });
    }

    await Chat.findByIdAndDelete(chatId);
    await Message.deleteMany({ chatId: chatId });

    // Notify all members that the group is deleted
    const io = req.app.get('io');
    chat.users.forEach(userId => {
      io.to(userId.toString()).emit('chat-group-deleted', chatId);
    });

    res.status(200).json({ message: "Group deleted successfully", chatId: chatId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.transferGroupAdmin = async (req, res) => {
  const { chatId, userId } = req.body;
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).send("Chat Not Found");

    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).send("Only admin can transfer rights");
    }

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { groupAdmin: userId },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      res.status(404).send("Chat Not Found");
    } else {
      const io = req.app.get('io');
      updatedChat.users.forEach(user => {
        io.to(user._id.toString()).emit('chat-group-update', updatedChat);
      });
      res.json(updatedChat);
    }
  } catch (error) {
    res.status(400).send(error.message);
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
