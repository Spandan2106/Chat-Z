// backend/src/routes/status.routes.js
const router = require("express").Router();
const { createStatus, getStatuses, deleteStatus, viewStatus } = require("../controllers/status.controller");
const protect = require("../middlewares/auth.middleware");

router.post("/", protect, createStatus);
router.get("/", protect, getStatuses);
router.delete("/:id", protect, deleteStatus);
router.put("/:id/view", protect, viewStatus);

module.exports = router;
