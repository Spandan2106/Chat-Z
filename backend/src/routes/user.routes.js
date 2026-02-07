const router = require("express").Router();
const { getUsers, updateProfile, deleteUser, addContact, getContacts, blockUser, unblockUser, getBlockedUsers, toggleMute, reportUser, toggleStarMessage, uploadPicture } = require("../controllers/user.controller");
const protect = require("../middlewares/auth.middleware");
const admin = require("../middlewares/admin.middleware");
const multer = require("multer");

const upload = multer({ dest: "backend/uploads/" });

router.get("/", protect, getUsers);
router.get("/contacts", protect, getContacts);
router.get("/blocked", protect, getBlockedUsers);
router.put("/addcontact", protect, addContact);
router.put("/block", protect, blockUser);
router.put("/unblock", protect, unblockUser);
router.put("/mute", protect, toggleMute);
router.put("/star", protect, toggleStarMessage);
router.post("/report", protect, reportUser);
router.put("/profile", protect, updateProfile);
router.post("/upload-picture", protect, upload.single("picture"), uploadPicture);
router.delete("/:id", protect, deleteUser);

module.exports = router;