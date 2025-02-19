import asyncHandler from "express-async-handler";
import authService from "../services/auth.service.js";
import helperFunc from "../utils/helperFunc.js";

const signup = asyncHandler(async (req, res) => {
  try {
    const user = await authService.signup(req.body);
    res
      .status(201)
      .json(helperFunc.successResponse(true, "User created", user));
  } catch (error) {
    res.status(400).json(helperFunc.errorResponse(false, error.message));
  }
});

const login = asyncHandler(async (req, res) => {
  try {
    const user = await authService.login(req.body);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "User logged in", user));
  } catch (error) {
    res.status(400).json(helperFunc.errorResponse(false, error.message));
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    console.log("User log out", req.user._id);
    await authService.logout(req.user._id);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "User logged out", {}));
  } catch (error) {
    res.status(400).json(helperFunc.errorResponse(false, error.message));
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const accessToken = await authService.refreshAccessToken(
      req.body.refreshToken
    );
    res.status(200).json(
      helperFunc.successResponse(true, "Access token refreshed", {
        accessToken,
      })
    );
  } catch (error) {
    res.status(400).json(helperFunc.errorResponse(false, error.message));
  }
});

const loginWithGoogle = asyncHandler(async (req, res) => {
  try {
    const response = await authService.loginWithGoogle(req.body.tokenId);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "User logged in", response));
  } catch (error) {
    res.status(400).json(helperFunc.errorResponse(false, error.message));
  }
});

const sendOTP = asyncHandler(async (req, res) => {
  try {
    await authService.sendOTP(req.body.email);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "OTP sent to email", {}));
  } catch (error) {
    res.status(400).json(helperFunc.errorResponse(false, error.message));
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  try {
    await authService.verifyOTP(req.body);
    res.status(200).json(helperFunc.successResponse(true, "OTP verified", {}));
  } catch (error) {
    res.status(400).json(helperFunc.errorResponse(false, error.message));
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  try {
    await authService.resetPassword(req.body.email, req.body.password);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "Password reset successful", {}));
  } catch (error) {
    res.status(400).json(helperFunc.errorResponse(false, error.message));
  }
});

export default {
  signup,
  login,
  logout,
  refreshAccessToken,
  loginWithGoogle,
  sendOTP,
  verifyOTP,
  resetPassword,
};
