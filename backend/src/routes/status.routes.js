// backend/src/routes/status.routes.js
const router = require("express").Router();
const { createStatus, getStatuses } = require("../controllers/status.controller");
const protect = require("../middlewares/auth.middleware");

router.post("/", protect, createStatus);
router.get("/", protect, getStatuses);

module.exports = router;
