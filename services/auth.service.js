import jwt from "jsonwebtoken";
import bycrypt from "bcryptjs";
import User from "../models/user.schema.js";
import Token from "../models/token.schema.js";
import OTP from "../models/otp.schema.js";
import OTPConfig from "../utils/OTPConfig.js";
import { OAuth2Client } from "google-auth-library";
import { Aggregate } from "mongoose";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
      },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );
  }

  async signup(data) {
    let { username, email, password, dob, avatarUrl } = data;

    console.log("Signup data:", data);

    if (!username || !email || !password || !dob) {
      throw new Error("Missing required fields");
    }

    const existingAccount = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingAccount) {
      throw new Error("Account already exists");
    }

    if (!avatarUrl) {
      // default avatar
      avatarUrl = "https://i.pinimg.com/1200x/d7/fa/93/d7fa938f70599a3213088646e35eb690.jpg";
    }

    // convert birthday to date
    const newUser = new User({
      username,
      email,
      password: bycrypt.hashSync(password, 10),
      avatar_url: avatarUrl,
      dob: new Date(dob),
    });
    const savedUser = await newUser.save();

    // return user and tokens
    const userObj = savedUser.toObject();
    delete userObj.password;

    return userObj;
  }

  async login(data) {
    const { email, password } = data;
    let user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const isValidPassword = bycrypt.compareSync(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid password");
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // save refresh token in the database
    const newToken = new Token({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    await newToken.save();

    // return user and tokens
    const userObj = user.toObject();
    delete userObj.password;

    return {
      user: userObj,
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) throw new Error("Invalid token");

    const token = await Token.findOne({ token: refreshToken });
    if (!token) throw new Error("Invalid token");

    if (token.expiresAt < new Date()) {
      await Token.delete({ token: refreshToken });
      throw new Error("Token expired");
    }

    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(decoded.id);
      if (!user) throw new Error("User not found");

      const accessToken = this.generateAccessToken(user);

      return accessToken;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  async logout(userId) {
    if (!userId) throw new Error("Invalid user id");

    try {
      await Token.deleteMany({ userId });
      return true;
    } catch (error) {
      throw new Error("Error logging out user: " + error.message);
    }
  }

  async loginWithGoogle(tokenId) {
    if (!tokenId) throw new Error("Missing tokenId");

    try {
      console.log("Verifying Google user...");
      const ticket = await client.verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const googleId = payload["sub"];
      const email = payload["email"];
      const username = payload["name"];

      console.log("Google user:", { googleId, email, username });

      let user = await User.findOne({
        $or: [{ email }, { googleId }],
      });

      if (!user) {
        // create new user
        user = new User({
          username,
          email,
          googleId,
        });
        await user.save();
      }

      const accessToken = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);
      return {
        user,
        tokens: {
          accessToken,
          refreshToken,
        },
      };
    } catch (error) {
      throw new Error("Error logging in with Google: " + error.message);
    }
  }

  async sendOTP(email) {
    if (!email) throw new Error("Missing email");

    // find existing user with email
    const user = await User.findOne({ email });
    if (!user) throw new Error("User with this email does not exist");

    // delete existing OTPs for this email
    await OTP.deleteMany({ email });

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const savedOTP = new OTP({
      email,
      otp,
      expiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    });

    console.log("Now: ", new Date(Date.now()));
    console.log("Expery date:", savedOTP.expiry);

    await savedOTP.save();

    // send OTP to user
    await OTPConfig.sendOTP(email, otp);
    return true;
  }

  async verifyOTP(data) {
    const { email, otp } = data;
    if (!email || !otp) throw new Error("Missing required fields");

    const existingOTP = await OTP.findOne({ email, otp });
    if (!existingOTP) throw new Error("Invalid OTP");

    if (existingOTP.expiry < new Date()) {
      await OTP.deleteOne({ email, otp });
      throw new Error("OTP expired");
    }

    // mark OTP as verified
    existingOTP.verified = true;
    await existingOTP.save();

    return true;
  }

  async resetPassword(data) {
    const { email, password, otp } = data;
    if (!email || !password || !otp) throw new Error("Missing required fields");

    const existingOTP = await OTP.findOne({
      email,
      otp,
      verified: true,
    });
    if (!existingOTP) throw new Error("Invalid or expired OTP. Please try again.");

    if (existingOTP.expiry < new Date()) {
      await OTP.deleteOne({ email, otp });
      throw new Error("OTP expired");
    }

    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    // update password
    user.password = bycrypt.hashSync(password, 10);
    await user.save();

    return true;
  }

  async checkUsernameExists(username) {
    if (!username) throw new Error("Missing username");

    const user = await User.findOne({ username });
    return !!user;
  }
}

export default new AuthService();
