import mongoose from "mongoose";
import User from "../models/user.schema.js";
import bcrypt from "bcryptjs";

class ProfileService {
  cleanUserData(user) {
    return {
      _id: user._id,
      email: user.email,
      username: user.username,
      avatar_url: user.avatar_url,
      language: user.language,
      theme: user.theme
    };
  }

  async getUserProfile(userId) {
    if (!userId) throw new Error("Invalid user id");

    const user = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          avatar_url: 1,
        },
      },
    ]);
    if (!user) throw new Error("User not found");

    return user;
  }

  async updateUserProfile(userId, data) {
    if (!userId) throw new Error("Invalid user id");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const { username, avatar_url, language, theme } = data;

    if (username) {
      // update username
      await User.updateOne({ _id: userId }, { $set: { username } });
    }

    if (avatar_url) {
      // update avatar_url
      await User.updateOne({ _id: userId }, { $set: { avatar_url } });
    }

    if (language) {
      // update language
      await User.updateOne({ _id: userId }, { $set: { language } });
    }

    if (theme) {
      // update theme
      await User.updateOne({ _id: userId }, { $set: { theme } });
    }

    const updatedUser = await User.findById(userId);
    return updatedUser;
  }

  async changePassword(userId, data) {
    if (!userId) throw new Error("Invalid user id");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const { oldPassword, newPassword } = data;

    if (!oldPassword || !newPassword)
      throw new Error("Missing required fields");

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new Error("Invalid password");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return {};
  }

  async uploadAvatar(userId, avatarUrl) {
    if (!userId) throw new Error("Invalid user id");
    if (!avatarUrl) throw new Error("Invalid avatar url");

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar_url: avatarUrl },
      { new: true }
    );

    return updatedUser;
  }

  async changeTheme(userId, theme) {
    if (!userId) throw new Error("Invalid user id");
    if (!theme) throw new Error("Invalid theme");

    if (!["light", "dark"].includes(theme))
      throw new Error("Invalid theme value");

    const updated = await User.findByIdAndUpdate(
      userId,
      { theme },
      { new: true }
    );

    return this.cleanUserData(updated);
  }

  async changeLanguage(userId, language) {
    if (!userId) throw new Error("Invalid user id");
    if (!language) throw new Error("Invalid language");

    if (!["en", "vi"].includes(language))
      throw new Error("Invalid language value");

    const updated = await User.findByIdAndUpdate(
      userId,
      { language },
      { new: true }
    );

    return this.cleanUserData(updated);
  }

  async addFCMToken(userId, fcmToken) {
    if (!userId) throw new Error("Invalid user id");
    if (!fcmToken) throw new Error("Invalid FCM token");

    const updated = await User.findByIdAndUpdate(
      userId,
      { fcm_token: fcmToken },
      { new: true }
    );

    return this.cleanUserData(updated);
  }
}

export default new ProfileService();
