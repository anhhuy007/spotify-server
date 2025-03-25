import admin from "../utils/firebase.js";
import User from "../models/user.schema.js";

class NotificationService {
  async sendNotification(userId, title, body) {
    const deviceToken = await User.findById(userId).select("fcm_token");

    if (!deviceToken) {
      console.log("Token not found");
      return;
    }

    const message = {
      token: deviceToken.fcm_token,
      data: {
        title: title,
        body: body,
      },
    };

    await admin.messaging().send(message);
    console.log("✅ Notification sent successfully");
  }

  async sendNotificationToUsers(userIds, title, body) {
    const users = await User.find({ _id: { $in: userIds } });
    const deviceTokens = users.map((user) => user.fcm_token);

    const message = {
      tokens: deviceTokens,
      data: {
        title: title,
        body: body,
      },
    };

    await admin.messaging().sendEachForMulticast(message);
    console.log("✅ Notification sent successfully");
  }

  async broadcastNotification(title, body) {
    const users = await User.find();
    const deviceTokens = users.map((user) => user.fcm_token);

    for (const token of deviceTokens) {
      if (!token) {
        // console.log("Token not found");
        continue;
      }
      console.log("Token: ", token);
    }

    const message = {
      tokens: deviceTokens,
      data: {
        title: title,
        body: body,
      },
    };

    await admin.messaging().sendEachForMulticast(message);
    console.log("✅ Notification sent successfully");
  }
}

export default new NotificationService();
