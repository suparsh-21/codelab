const express = require("express");
const router = express.Router();
const {
  registerController,
  loginController,
  logoutController,
  getMeController,
  getSecurityQuestionController,
  resetPasswordController,
  changePasswordController,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/logout", logoutController);
router.get("/me", authMiddleware, getMeController);
router.post("/security-question", getSecurityQuestionController);
router.post("/reset-password", resetPasswordController);
router.post("/change-password", authMiddleware, changePasswordController);

module.exports = router;
