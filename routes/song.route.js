import songController from "../controllers/song.controller.js";
import express from "express";

const router = express.Router();

router.get("/topSong", songController.getTopSong);
router.get("/mostSong", songController.getMostSong);
router.get("/popular/:id", songController.getPopularSongs);
router.get("/new", songController.getNewSongs);
router.get("/random", songController.getRandomSongs);
router.get("/:id", songController.getSongById);

export default router;
