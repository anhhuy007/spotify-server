import express from 'express';
import authController from '../controllers/auth.controller.js';
import authenticateToken from '../middlewares/auth.middleware.js';
const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.post('/refresh-token', authController.refreshAccessToken);

// protected routes
router.use(authenticateToken);
router.delete('/logout', authController.logout);

export default router;