import songController from "../controllers/song.controller.js";
import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/topSong",
  authMiddleware.authenticateUser,
  songController.getTopSong
);
router.get(
  "/mostSong",
  authMiddleware.authenticateUser,
  songController.getMostSong
);
router.get(
  "/popular/:id",
  authMiddleware.authenticateUser,
  songController.getPopularSongs
);

router.get("/new", authMiddleware.authenticateUser, songController.getNewSongs);
router.get(
  "/random",
  authMiddleware.authenticateUser,
  songController.getRandomSongs
);
router.get("/:id", authMiddleware.authenticateUser, songController.getSongById);

export default router;
