import asyncHandler from "express-async-handler";
import userService from "../services/user.service.js";
import helperFunc from "../utils/helperFunc.js";

const getUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await userService.getUserProfile(req.params.userId);
    res
      .status(200)
      .json(
        helperFunc.successResponse(
          true,
          "User profile retrieved successfully",
          user
        )
      );
  } catch (error) {
    console.log("Get user profile error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to get user profile"));
  }
});

const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const user = await userService.updateUserProfile(req.user._id, req.body);
    res
      .status(200)
      .json(
        helperFunc.successResponse(
          true,
          "User profile updated successfully",
          user
        )
      );
  } catch (error) {
    console.log("Update user profile error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to update user profile"));
  }
});

const changePassword = asyncHandler(async (req, res) => {
  try {
    const user = await userService.changePassword(req.user._id, req.body);
    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "Password updated successfully", user)
      );
  } catch (error) {
    console.log("Change password error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to update password"));
  }
});

const uploadAvatar = asyncHandler(async (req, res) => {
  try {
    console.log("Full file object:", req.file);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Cloudinary provides the secure_url in the uploaded file object
    const avatarUrl = req.file.path || req.file.location || req.file.secure_url;

    if (!avatarUrl) {
      return res.status(500).json({
        success: false,
        message: "Failed to get upload URL",
        data: req.file,
      });
    }

    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatarUrl,
      },
    });
  } catch (error) {
    console.log("Upload avatar error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to upload avatar"));
  }
});

const changeTheme = asyncHandler(async (req, res) => {
  try {
    const user = await userService.changeTheme(req.user._id, req.body.theme);
    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "Theme updated successfully", user)
      );
  } catch (error) {
    console.log("Change theme error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to update theme"));
  }
});

const changeLanguage = asyncHandler(async (req, res) => {
  try {
    const user = await userService.changeLanguage(req.user._id, req.body.language);
    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "Language updated successfully", user)
      );
  } catch (error) {
    console.log("Change language error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to update language"));
  }
});

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar,
  changeTheme,
  changeLanguage,
};
