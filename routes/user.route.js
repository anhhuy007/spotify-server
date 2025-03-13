import express from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// protected routes
router.use(authMiddleware);
router.get("/profile/:userId", userController.getUserProfile);
router.put("/profile", userController.updateUserProfile);
router.put("/change-password", userController.changePassword);

export default router;
