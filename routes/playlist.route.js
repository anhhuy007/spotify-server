import express from "express";
import playlistController from "../controllers/playlist.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();




// Public routes
router.get("/top", playlistController.getTopPlaylists);
router.get("/popular", playlistController.getPopularPlaylists);
router.get("/new", playlistController.getNewPlaylists);
router.get("/", playlistController.getPlaylistsWithFilter);
router.get("/:id", playlistController.getPlaylistById);
router.get("/:id/songs", playlistController.getPlaylistSongs);

router.get(
  "/library/playlists",
  authMiddleware.authenticateUser,
  playlistController.getUserPlaylists
);


// Protected routes - require authentication
// User playlist management

router.get(
  "/playlist/:id",
  authMiddleware.authenticateUser,
  playlistController.getPlaylistById
);
router.get(
  "/playlist/:id/songs",
  authMiddleware.authenticateUser,
  playlistController.getPlaylistSongs
);

// Playlist CRUD operations
router.post(
  "/createNewPlaylist",
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
router.put(
  "/:id/info",
  authMiddleware.authenticateUser,
  playlistController.updatePlaylistInfo
);

// Song management within playlists
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

export default router;
