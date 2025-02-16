import express from "express";
import authRoutes from "./auth.route.js";

const router = express.Router();

// public routes
router.use("/auth", authRoutes);

// protected routes

export default router;
