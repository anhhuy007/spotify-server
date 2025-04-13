import express from "express";
import notificationController from "../controllers/notification.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send", notificationController.sendNotification);
router.post("/send-to-users", notificationController.sendNotificationToUsers);
router.post(
  "/broadcast",
  authMiddleware.authenticateUser,
  authMiddleware.authorizeRoles("admin"),
  notificationController.broadcastNotification
);

export default router;
