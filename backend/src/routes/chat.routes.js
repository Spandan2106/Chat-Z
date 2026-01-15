const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const { createChat } = require("../controllers/chat.controller");

router.post("/", auth, createChat);

module.exports = router;
