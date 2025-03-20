import songController from "../controllers/song.controller.js";
import express from "express";

const router = express.Router();

router.get("/popular", songController.getPopularSongs);
router.get("/new", songController.getNewSongs);
router.get("/random", songController.getRandomSongs);
router.get("/:id", songController.getSongById);

export default router;
