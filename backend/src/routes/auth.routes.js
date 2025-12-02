const express = require("express");
const authController = require("../controllers/auth.controller");
const { authUser } = require("../middlewares/auth.middleware");
const {
  registerValidation,
  loginValidation,
  updatePasswordValidation,
  handleValidationErrors
} = require("../middlewares/validation.middleware");
const router = express.Router();

router.post("/user/register", registerValidation, handleValidationErrors, authController.registerUser);
router.post("/user/login", loginValidation, handleValidationErrors, authController.loginUser);
router.get("/user/logout", authController.logoutUser);

router.get("/me", authUser, authController.getLoggedInUser);
router.put("/profile", authUser, authController.updateProfile);
router.put("/password", authUser, updatePasswordValidation, handleValidationErrors, authController.updatePassword);

// Forgot Password Routes
router.post("/forgot-password", authController.requestPasswordReset);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
