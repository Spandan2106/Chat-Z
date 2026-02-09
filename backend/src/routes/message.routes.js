const express = require("express");
const {
  allMessages,
  sendMessage,
  fetchChats,
  accessChat,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
  deleteChatHistory,
  deleteForMe,
  deleteForEveryone,
  deleteGroup,
  transferGroupAdmin,
  markMessagesAsRead,
  sendMediaMessage,
  searchGroups
} = require("../controllers/message.controller");
const protect = require("../middlewares/auth.middleware");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

// Specific routes MUST come before parameterized routes (/:chatId)
router.route("/chat").post(protect, accessChat);
router.route("/chat").get(protect, fetchChats);
router.route("/groups").get(protect, searchGroups);
router.route("/group").post(protect, createGroupChat);
router.route("/grouprename").put(protect, renameGroup);
router.route("/groupadd").put(protect, addToGroup);
router.route("/groupremove").put(protect, removeFromGroup);
router.route("/group/admin").put(protect, transferGroupAdmin);
router.route("/group/:chatId").delete(protect, deleteGroup);
router.route("/read").put(protect, markMessagesAsRead);
router.route("/media").post(protect, upload.single("file"), sendMediaMessage);

// Message operations
router.route("/:messageId/delete-for-me").delete(protect, deleteForMe);
router.route("/:messageId/delete-for-everyone").delete(protect, deleteForEveryone);

// Parameterized routes
router.route("/:chatId").get(protect, allMessages);
router.route("/:chatId").delete(protect, deleteChatHistory);

// Root route
router.route("/").post(protect, sendMessage);

module.exports = router;