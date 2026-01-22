const router = require("express").Router();
const { getUsers, updateProfile, deleteUser, addContact, getContacts, blockUser, unblockUser, getBlockedUsers, toggleMute } = require("../controllers/user.controller");
const protect = require("../middlewares/auth.middleware");
const admin = require("../middlewares/admin.middleware");

router.get("/", protect, getUsers);
router.get("/contacts", protect, getContacts);
router.get("/blocked", protect, getBlockedUsers);
router.put("/addcontact", protect, addContact);
router.put("/block", protect, blockUser);
router.put("/unblock", protect, unblockUser);
router.put("/mute", protect, toggleMute);
router.put("/profile", protect, updateProfile);
router.delete("/:id", protect, deleteUser);

module.exports = router;