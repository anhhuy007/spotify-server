import express from "express";
import albumController from "../controllers/album.controller.js";
import authenticateToken from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/topAlbum", albumController.getTopAlbum);
router.get("/mostAlbum", albumController.getMostAlbum);
router.get("/alsoLike", albumController.getAlsoLike);
router.get("/popular", albumController.getPopularAlbums);
router.get("/new", albumController.getNewAlbums);
router.get("/byArtists", albumController.getAlbumsByArtistNames);
router.get("/:id", albumController.getAlbumById);
router.get("/:id/songs", albumController.getAlbumSongs);
// routet.get('/albums', albumController.getAllAlbums());

// router.use(authorize(Role.Artist));
// router.post('/', authenticateToken, albumController.createAlbum);
// router.put('/:id', authenticateToken, albumController.updateAlbum);
// router.delete('/:id', authenticateToken, albumController.deleteAlbum);


router.get("/", albumController.getAlbumsWithFilter);


export default router;
