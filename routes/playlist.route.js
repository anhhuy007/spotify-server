import express from "express";
import playlistController from "../controllers/playlist.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get(
  "/user-playlist",
  authMiddleware.authenticateUser,
  playlistController.getUserPlaylist
);
router.post(
  "/create-playlist",
  authMiddleware.authenticateUser,
  playlistController.createNewPlaylist
);
router.post(
  "/add-song",
  authMiddleware.authenticateUser,
  playlistController.addSongToPlaylist
);
router.get(
  "/playlist-by-id/:id",
  authMiddleware.authenticateUser,
  playlistController.getPlaylistById
);
router.get(
  "/playlist-songs/:id",
  authMiddleware.authenticateUser,
  playlistController.getPlaylistSongs
);
router.get(
  "/random-songs/:id",
  authMiddleware.authenticateUser,
  playlistController.getRandomSongs
);

router.delete(
  "/:playlistId/remove-song/:songId",
  authMiddleware.authenticateUser,
  playlistController.removeSongFromPlaylist
);
router.post(
  "/:playlistId/update-info",
  authMiddleware.authenticateUser,
  playlistController.updatePlaylistInfo
);
router.delete(
  "/remove-playlist/:playlistId",
  authMiddleware.authenticateUser,
  playlistController.removePlaylist
);

export default router;
