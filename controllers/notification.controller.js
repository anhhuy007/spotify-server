import asyncHandler from "express-async-handler";
import notificationService from "../services/notification.service.js";
import User from "../models/user.schema.js";

const sendNotification = asyncHandler(async (req, res) => {
  const { userId, title, body } = req.body;

  try {
    await notificationService.sendNotification(userId, title, body);
    res
      .status(200)
      .json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error sending notification" });
  }
});

const sendNotificationToUsers = asyncHandler(async (req, res) => {
  const { userIds, title, body } = req.body;

  try {
    await notificationService.sendNotificationToUsers(userIds, title, body);
    res
      .status(200)
      .json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error sending notification" });
  }
});

const broadcastNotification = asyncHandler(async (req, res) => {
  const { title, body } = req.body;

  try {
    await notificationService.broadcastNotification(title, body);
    res
      .status(200)
      .json({ success: true, message: "Notification sent successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error sending notification" + error });
  }
});

export default { sendNotification, sendNotificationToUsers, broadcastNotification };
