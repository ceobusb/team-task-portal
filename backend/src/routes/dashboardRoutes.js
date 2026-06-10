const express = require("express");
const router = express.Router();
const { getSummary, getWorkload } = require("../controllers/dashboardController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.get("/summary", authMiddleware, roleMiddleware("MANAGER"), getSummary);
router.get("/workload", authMiddleware, roleMiddleware("MANAGER"), getWorkload);

module.exports = router;
