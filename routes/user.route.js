import express from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../utils/cloudinary.js";
import helperFunc from "../utils/helperFunc.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticateUser);

/**
 * @desc Test route to verify user route availability
 * @route GET /api/users/profile/hello
 * @access Private
 */
router.get("/profile/hello", async (req, res) => {
  res
    .status(200)
    .json(helperFunc.successResponse(true, "Hello from user route", {}));
});

/**
 * @desc Change user password
 * @route PUT /api/users/profile/change-password
 * @access Private
 */
router.put("/profile/change-password", userController.changePassword);

/**
 * @desc Upload user avatar
 * @route POST /api/users/profile/upload-avatar
 * @access Private
 */
router.post(
  "/profile/upload-avatar",
  upload.single("image"),
  userController.uploadAvatar
);

/**
 * @desc Change user language preference
 * @route POST /api/users/profile/change-language
 * @access Private
 */
router.post("/profile/change-language", userController.changeLanguage);

/**
 * @desc Change user theme preference
 * @route POST /api/users/profile/change-theme
 * @access Private
 */
router.post("/profile/change-theme", userController.changeTheme);

/**
 * @desc Get user profile by ID
 * @route GET /api/users/profile/:userId
 * @access Private
 */
router.get("/profile/:userId", userController.getUserProfile);

/**
 * @desc Update user profile
 * @route PUT /api/users/profile
 * @access Private
 */
router.put("/profile", userController.updateUserProfile);

/**
 * @desc Add FCM token for push notifications
 * @route POST /api/users/add-fcm-token
 * @access Private
 */
router.post("/add-fcm-token", userController.addFCMToken);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error("User route error:", err);
  res.status(500).json(
    helperFunc.errorResponse(
      false,
      "Something went wrong",
      process.env.NODE_ENV === "development" ? err.message : {}
    )
  );
});

export default router;