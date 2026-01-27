const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const { sendMessage, sendMediaMessage, allMessages, accessChat, fetchChats, createGroupChat, deleteAllChats, deleteChatHistory, deleteForMe, deleteForEveryone } = require("../controllers/message.controller");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.route("/").post(auth, sendMessage);
router.route("/:chatId").get(auth, allMessages);
router.route("/chat").post(auth, accessChat);
router.route("/chat").get(auth, fetchChats);
router.route("/group").post(auth, createGroupChat);
router.route("/delete-all").delete(auth, deleteAllChats);
router.route("/:chatId").delete(auth, deleteChatHistory);

router.post(
  "/media",
  auth,
  upload.single("file"),
  sendMediaMessage
);

router.delete("/:messageId/delete-for-me", auth, deleteForMe);
router.delete("/:messageId/delete-for-everyone", auth, deleteForEveryone);

module.exports = router;
