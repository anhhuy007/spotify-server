import songController from "../controllers/song.controller.js";
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/topSong", songController.getTopSong);
router.get("/mostSong", songController.getMostSong);
router.get(
  "/popular/:id",
  authMiddleware.authenticateUser,
  songController.getPopularSongs
);
router.get("/new", songController.getNewSongs);
router.get("/random", songController.getRandomSongs);
router.get("/:id", songController.getSongById);

export default router;
