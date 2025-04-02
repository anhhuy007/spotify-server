import express from "express";
import authRoutes from "./auth.route.js";
import userRoutes from "./user.route.js";
import albumRoutes from "./album.route.js";
import searchRoutes from "./search.route.js";
import genreRoutes from "./genre.route.js";
import artistRoutes from "./artist.route.js";
import subscriptionRoutes from "./subscription.route.js";
import songRoutes from "./song.route.js";
import notificationRoutes from "./notification.route.js";
import followerRoutes from "./follower.route.js";

const router = express.Router();

// public routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/artist", artistRoutes);
router.use("/album", albumRoutes);
router.use("/album", albumRoutes);
router.use("/search", searchRoutes);
router.use("/genre", genreRoutes);
router.use("/artist", artistRoutes);
router.use("/song", songRoutes);
router.use("/subscription", subscriptionRoutes);  
router.use("/notification", notificationRoutes);
router.use("/follower", followerRoutes);

router.get("/", (req, res) => {
  res.send("Hello from Spotify Clone!");
});

export default router;
