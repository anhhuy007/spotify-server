import express from "express";
import artistController from "../controllers/artist.controller.js";
const router = express.Router();

router.get("/topArtist", artistController.getTopArtist);
router.get("/mostArtist", artistController.getMostArtist);
router.get("/popular", artistController.getPopularArtists);

router.get("/listArtist", artistController.getListArtists);
router.get("/getArtist/:id", artistController.getArtist);
router.get(
  "/listDiscographyAlbum/:id",
  artistController.getListDiscographyAlbum
);
router.get("/listDiscographyEP/:id", artistController.getListDiscographyEP);
router.get(
  "/listDiscographyCollection/:id",
  artistController.getListDiscographyCollection
);
router.get("/listDiscographyHave/:id", artistController.getListDiscographyHave);

router.get(
  "/getListPopularArtistDetail/:id",
  artistController.getListPopularArtistDetail
);

router.get(
  "/getListFansAlsoLikeArtistDetail/:id",
  artistController.getListFansAlsoLike
);

router.get("/getAlbumArtistDetail/:id", artistController.getAlbumArtistDetail);

export default router;
