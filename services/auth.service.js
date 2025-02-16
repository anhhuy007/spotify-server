import jwt from "jsonwebtoken";
import bycrypt from "bcryptjs";
import User from "../models/user.schema.js";
import Token from "../models/token.schema.js";

class AuthService {
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
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
    const { username, email, password } = data;

    if (!username || !email || !password) {
      throw new Error("Missing required fields");
    }

    const existingAccount = await User.findOne({
      $or: [{ email }, { username }],
    });
    if (existingAccount) {
      throw new Error("Account already exists");
    }

    const newUser = new User({
      username,
      email,
      password: bycrypt.hashSync(password, 10),
    });
    const savedUser = await newUser.save();

    return savedUser;
  }

  async login(data) {
    const { username, password } = data;
    let user = await User.findOne({ username: username });
    if (!user) {
      // find by email
      user = await User.findOne({ email: username });

      if (!user) throw new Error("User not found");
    }

    const isValidPassword = bycrypt.compare(password, user.password);
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
    }
    catch (error) {
        throw new Error("Error logging out user: " + error.message);
    }
  }
}

export default new AuthService();
