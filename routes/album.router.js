import express from "express";
import albumController from "../controllers/album.controller.js";

const router = express.Router();

router.get("/topAlbum", albumController.getTopAlbum);
router.get("/alsoLike", albumController.getAlsoLike);


export default router;