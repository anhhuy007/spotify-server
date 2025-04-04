import express from "express";
import albumController from "../controllers/album.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/topAlbum", albumController.getTopAlbum);
router.get("/mostAlbum", albumController.getMostAlbum);
router.get("/alsoLike", albumController.getAlsoLike);
router.get(
  "/popular",
  authMiddleware.authenticateUser,
  albumController.getPopularAlbums
);
router.get("/new", albumController.getNewAlbums);
router.get("/by-artists", albumController.getAlbumsByArtistNames);
router.get("/:id", albumController.getAlbumById);
router.get("/:id/songs", albumController.getAlbumSongs);

router.get("/", albumController.getAlbumsWithFilter);

export default router;
