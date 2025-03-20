import express from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import artistRoutes from "./artist.router.js";
import albumRoutes from "./album.router.js";

const router = express.Router();

// public routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/artist", artistRoutes);
router.use("/album", albumRoutes);

// protected routes

export default router;
