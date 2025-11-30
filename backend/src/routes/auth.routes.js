const express = require("express");
const authController = require("../controllers/auth.controller");
const { authUser } = require("../middlewares/auth.middleware");
const router = express.Router();

router.post("/user/register", authController.registerUser);
router.post("/user/login", authController.loginUser);
router.get("/user/logout", authController.logoutUser);

router.get("/me", authUser, authController.getLoggedInUser);
router.put("/profile", authUser, authController.updateProfile);
router.put("/password", authUser, authController.updatePassword);

module.exports = router;
