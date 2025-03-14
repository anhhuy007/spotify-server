import asyncHandler from "express-async-handler";
import authService from "../services/auth.service.js";
import helperFunc from "../utils/helperFunc.js";

const signup = asyncHandler(async (req, res) => {
  try {
    const user = await authService.signup(req.body);
    console.log("Signup - User created: ", user);
    res
      .status(201)
      .json(helperFunc.successResponse(true, "User created", user));
  } catch (error) {
    console.log("Signup error: ", error);
    res
      .status(400)
      .json(
        helperFunc.errorResponse(false, "Failed to signup: " + error.message)
      );
  }
});

const login = asyncHandler(async (req, res) => {
  try {
    const user = await authService.login(req.body);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "User logged in", user));
  } catch (error) {
    console.log("Login error: ", error);
    res
      .status(401)
      .json(helperFunc.errorResponse(false, "Login failed: " + error.message));
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
    console.log("Logout error: ", error);
    res.status(400).json(helperFunc.errorResponse(false, "Failed to logout"));
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
    console.log("Refresh access token error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to refresh access token"));
  }
});

const loginWithGoogle = asyncHandler(async (req, res) => {
  try {
    const response = await authService.loginWithGoogle(req.body.tokenId);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "User logged in", response));
  } catch (error) {
    console.log("Login with Google error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to login with Google"));
  }
});

const sendOTP = asyncHandler(async (req, res) => {
  try {
    await authService.sendOTP(req.body.email);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "OTP sent to email", {}));
  } catch (error) {
    console.log("Send OTP error: ", error);
    res
      .status(400)
      .json(
        helperFunc.errorResponse(false, "Failed to send OTP: " + error.message)
      );
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  try {
    await authService.verifyOTP(req.body);
    res.status(200).json(helperFunc.successResponse(true, "OTP verified", {}));
  } catch (error) {
    console.log("Verify OTP error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to verify OTP"));
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  console.log("Reset password: ", req.body);

  try {
    await authService.resetPassword(req.body);

    res
      .status(200)
      .json(helperFunc.successResponse(true, "Password reset successful", {}));
  } catch (error) {
    console.log("Reset password error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to reset password"));
  }
});

const checkUsernameExists = asyncHandler(async (req, res) => {
  try {
    const existed = await authService.checkUsernameExists(req.query.username);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "Check username exists", { existed }));
  } catch (error) {
    console.log("Check username error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to check username"));
  }
});

const checkEmailExists = asyncHandler(async (req, res) => {
  try {
    const existed = await authService.checkEmailExists(req.query.email);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "Check email exists", { existed }));
  } catch (error) {
    console.log("Check email error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to check email"));
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
  checkUsernameExists,
  checkEmailExists
};
