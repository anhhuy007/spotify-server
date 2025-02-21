import mongoose from "mongoose";
import User from "../models/user.schema.js";
import bcrypt from "bcryptjs";

class ProfileService {
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
                    avatar_url: 1
                },
            },
        ])
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
            await User.updateOne(
                { _id: userId },
                { $set: { username } }
            );
        }

        if (avatar_url) {
            // update avatar_url
            await User.updateOne(
                { _id: userId },
                { $set: { avatar_url } }
            );
        }

        if (language) {
            // update language
            await User.updateOne(
                { _id: userId },
                { $set: { language } }
            );
        }

        if (theme) {
            // update theme
            await User.updateOne(
                { _id: userId },
                { $set: { theme } }
            );
        }        

        const updatedUser = await User.findById(userId);
        return updatedUser;
    }

    async changePassword(userId, data) {
        if (!userId) throw new Error("Invalid user id");

        const user = await User.findById(userId);
        if (!user) throw new Error("User not found");

        const { oldPassword, newPassword } = data;

        if (!oldPassword || !newPassword) throw new Error("Missing required fields");

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) throw new Error("Invalid password");

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        return {};
    }
}

export default new ProfileService();