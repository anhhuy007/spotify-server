import express from "express";
import albumController from "../controllers/album.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/topAlbum",
  authMiddleware.authenticateUser,
  albumController.getTopAlbum
);
router.get(
  "/mostAlbum",
  authMiddleware.authenticateUser,
  albumController.getMostAlbum
);
router.get(
  "/alsoLike",
  authMiddleware.authenticateUser,
  albumController.getAlsoLike
);
router.get(
  "/popular",
  authMiddleware.authenticateUser,
  albumController.getPopularAlbums
);
router.get(
  "/new",
  authMiddleware.authenticateUser,
  albumController.getNewAlbums
);
router.get(
  "/by-artists",
  authMiddleware.authenticateUser,
  albumController.getAlbumsByArtistNames
);
router.get(
  "/:id",
  authMiddleware.authenticateUser,
  albumController.getAlbumById
);
router.get(
  "/:id/songs",
  authMiddleware.authenticateUser,
  albumController.getAlbumSongs
);

router.get(
  "/",
  authMiddleware.authenticateUser,
  albumController.getAlbumsWithFilter
);

export default router;
