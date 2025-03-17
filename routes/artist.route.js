import artistController from "../controllers/artist.controller.js";
import express from "express";

const router = express.Router();
router.get("/popular", artistController.getPopularArtists);

export default router;
