import express from 'express';
import genreController from '../controllers/genre.controller.js';

const router = express.Router();

router.get('/', genreController.getGenres);
router.get('/by-id/:id', genreController.getGenreById);

export default router;
