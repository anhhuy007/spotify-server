import express from 'express';
import notificationController from '../controllers/notification.controller.js';

const router = express.Router();

router.post('/send', notificationController.sendNotification);
router.post('/send-to-users', notificationController.sendNotificationToUsers);
router.post('/broadcast', notificationController.broadcastNotification);

export default router;