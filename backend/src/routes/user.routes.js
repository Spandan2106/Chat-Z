const express = require("express");
const router = require("express").Router();
const { getUsers, updateProfile, deleteUser, addContact, getContacts, removeContact, blockUser, unblockUser, getBlockedUsers, toggleMute, reportUser, toggleStarMessage, uploadPicture, deleteAccount, changePassword, authAdmin, authSupport, createTicket, getTickets, replyTicket } = require("../controllers/user.controller");
const protect = require("../middlewares/auth.middleware");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.get("/", protect, getUsers);
router.get("/contacts", protect, getContacts);
router.get("/blocked", protect, getBlockedUsers);
router.put("/addcontact", protect, addContact);
router.put("/removecontact", protect, removeContact);
router.put("/block", protect, blockUser);
router.put("/unblock", protect, unblockUser);
router.put("/mute", protect, toggleMute);
router.put("/star", protect, toggleStarMessage);
router.post("/report", protect, reportUser);
router.put("/profile", protect, updateProfile);
router.put("/profile-pic", protect, upload.single("avatar"), uploadPicture);
router.put("/change-password", protect, changePassword);
router.delete("/account", protect, deleteAccount);
router.delete("/:id", protect, deleteUser);

router.post("/admin-login", authAdmin);
router.post("/support-login", authSupport);

router.post("/tickets", protect, createTicket);
router.get("/tickets", protect, getTickets);
router.put("/tickets/reply", protect, replyTicket);

module.exports = router;