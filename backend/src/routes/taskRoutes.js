const express = require("express");
const router = express.Router();

const {
  createTask,
  getTasks,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware("MANAGER"), createTask);
router.get("/", authMiddleware, getTasks);
router.put("/:id", authMiddleware, roleMiddleware("MANAGER"), updateTask);
router.patch("/:id/status", authMiddleware, updateTaskStatus);
router.delete("/:id", authMiddleware, roleMiddleware("MANAGER"), deleteTask);

module.exports = router;
