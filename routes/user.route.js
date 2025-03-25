import express from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../utils/cloudinary.js";
import helperFunc from "../utils/helperFunc.js";

const router = express.Router();

// protected routes
//  router.use(authMiddleware);
router.get("/profile/hello", async (req, res) => {
  res
    .status(200)
    .json(helperFunc.successResponse(true, "Hello from user route", {}));
});
router.put("/profile/change-password", userController.changePassword);
router.post("/profile/upload-avatar", upload.single("image"), userController.uploadAvatar);
router.post("/profile/change-language", authMiddleware, userController.changeLanguage);
router.post("/profile/change-theme", authMiddleware, userController.changeTheme);
router.get("/profile/:userId",authMiddleware, userController.getUserProfile);
router.put("/profile", userController.updateUserProfile);

export default router;
