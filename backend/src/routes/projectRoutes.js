const express = require("express");
const router = express.Router();

const { createProject, getProjects,updateProject,deleteProject } = require("../controllers/projectController");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

router.post("/", authMiddleware, roleMiddleware("MANAGER"), createProject);
router.get("/", authMiddleware, getProjects);
router.put("/:id",authMiddleware,roleMiddleware("MANAGER"),updateProject);
router.delete("/:id",authMiddleware,roleMiddleware("MANAGER"),deleteProject);

module.exports = router;
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJidXNyYUB0ZXN0LmNvbSIsInJvbGUiOiJNQU5BR0VSIiwiaWF0IjoxNzgxMDA0ODEyLCJleHAiOjE3ODEwMDg0MTJ9.bd0yGSyLs9fsPnweXOEpEOOxRbzmFXvtO3RHTayqrkA
