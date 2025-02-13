import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    res.send("Hello, world!");
});

router.get('/about', (req, res) => {
    res.send("About us");
});

export default router;