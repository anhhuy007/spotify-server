import express from "express";
import playlistController from "../controllers/playlist.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/top", playlistController.getTopPlaylists);
router.get("/popular", playlistController.getPopularPlaylists);
router.get("/new", playlistController.getNewPlaylists);

router.get("/:id", playlistController.getPlaylistById);
router.get("/:id/songs", playlistController.getPlaylistSongs);
router.get("/", playlistController.getPlaylistsWithFilter);

// Protected routes - require authentication
router.get(
  "/user/myPlaylists",
  authMiddleware.authenticateUser,
  playlistController.getUserPlaylists
);

router.post(
  "/",
  authMiddleware.authenticateUser,
  playlistController.createPlaylist
);
router.put(
  "/:id",
  authMiddleware.authenticateUser,
  playlistController.updatePlaylist
);
router.delete(
  "/:id",
  authMiddleware.authenticateUser,
  playlistController.deletePlaylist
);

router.post(
  "/:playlistId/songs/:songId",
  authMiddleware.authenticateUser,
  playlistController.addSongToPlaylist
);
router.delete(
  "/:playlistId/songs/:songId",
  authMiddleware.authenticateUser,
  playlistController.removeSongFromPlaylist
);

export default router;
