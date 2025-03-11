import express from 'express';
import albumController from '../controllers/album.controller.js';
import authenticateToken from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/popular', albumController.getPopularAlbums);
router.get('/new', albumController.getNewAlbums);

router.get('/:id', albumController.getAlbumById);
router.get('/', albumController.getAlbumsWithFilter);

// router.use(authorize(Role.Artist));
// router.post('/', authenticateToken, albumController.createAlbum);
// router.put('/:id', authenticateToken, albumController.updateAlbum);
// router.delete('/:id', authenticateToken, albumController.deleteAlbum);

export default router;