import express from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";

const router = express.Router();

// public routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);

// protected routes

export default router;
