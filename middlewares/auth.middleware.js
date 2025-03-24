import jwt from "jsonwebtoken";
import User from "../models/user.schema.js";

async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findOne({ username: decoded.username });

      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
      }

      return res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.error("Auth middleware error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function authorizeRoles(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!role.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: Requires ${role} role` }); 
    }

    next();
  }
}

export default { authenticateUser, authorizeRoles };
