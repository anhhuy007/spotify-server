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
    res.status(400).json(helperFunc.errorResponse(false, error.message));
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
    res.status(400).json(helperFunc.errorResponse(false, error.message));
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
    res.status(400).json(helperFunc.errorResponse(false, error.message));
  }
});

export default {
  getUserProfile,
  updateUserProfile,
  changePassword,
};
