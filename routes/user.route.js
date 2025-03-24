import express from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../utils/cloudinary.js";
import helperFunc from "../utils/helperFunc.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticateUser);

// Protected routes
router.put("/profile/change-password", userController.changePassword);
router.post(
  "/profile/upload-avatar",
  upload.single("image"),
  userController.uploadAvatar
);
router.post("/profile/change-language", userController.changeLanguage);
router.post("/profile/change-theme", userController.changeTheme);
router.get("/profile/:userId", userController.getUserProfile);
router.put("/profile", userController.updateUserProfile);
router.post("/add-fcm-token", userController.addFCMToken);

export default router;