const router = require("express").Router();
const { register, login, getMe, forgotPassword } = require("../controllers/auth.controller");
const auth = require("../middlewares/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe);
router.post("/forgot-password", forgotPassword);

module.exports = router;
