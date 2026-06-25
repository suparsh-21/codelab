const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const {
  createProjectController,
  getProjectsController,
  getProjectByIdController,
  updateProjectController,
  deleteProjectController,
} = require("../controllers/project.controller");

// all project routes need auth
router.use(authMiddleware);

router.post("/", createProjectController);
router.get("/", getProjectsController);
router.get("/:id", getProjectByIdController);
router.put("/:id", updateProjectController);
router.delete("/:id", deleteProjectController);

module.exports = router;
