import express from 'express';
import authController from '../controllers/auth.controller.js';
import authenticateToken from '../middlewares/auth.middleware.js';
const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/refresh-token', authController.refreshAccessToken);
router.post('/google', authController.loginWithGoogle);
router.delete('/logout', authenticateToken, authController.logout);
router.post('/forgot-password', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);

export default router;