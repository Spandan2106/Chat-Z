const express = require("express");
const router = express.Router();
const { deleteAccount, blockUser } = require("../controllers/user.controller");
const auth = require("../middlewares/auth.middleware");

router.delete("/delete", auth, deleteAccount);
router.put("/block/:userId", auth, blockUser);

module.exports = router;