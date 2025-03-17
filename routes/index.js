import express from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import albumRoutes from "./album.route.js";
import songRoutes from "./song.route.js";
import artistRoutes from "./artist.route.js";

const router = express.Router();

// public routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/album", albumRoutes);
router.use("/song", songRoutes);
router.use("/artist", artistRoutes);

router.get("/", (req, res) => {
  res.send("Hello from Spotify Clone!");
});

// protected routes

export default router;
