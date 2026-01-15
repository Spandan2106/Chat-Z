const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const { sendMessage, deleteChatHistory } = require("../controllers/message.controller");

router.post("/", auth, sendMessage);
router.delete("/:chatId", auth, deleteChatHistory);

module.exports = router;
