import helperFunc from "../utils/helperFunc.js";
import asyncHandler from "express-async-handler";
import ArtistService from "../services/artist.service.js";

const getListArtists = async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 0;
    const end = parseInt(req.query.end) || 10;

    if (start < 0 || end <= start) {
      return res.status(400).json({ message: "Invalid start or end values" });
    }

    const artists = await ArtistService.getListArtists(start, end);

    res
      .status(200)
      .json(helperFunc.successResponse(true, "List artists", artists));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getArtist = async (req, res) => {
  try {
    const { id } = req.params;

    const artist = await ArtistService.getArtist(id);

    res
      .status(200)
      .json(helperFunc.successResponse(true, "Get artist by id", artist));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getListDiscographyAlbum = async (req, res) => {
  try {
    const { id } = req.params;

    const albums = await ArtistService.getListDiscographyAlbum(id);
    console.log(albums);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "List albums discography", albums));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getListDiscographyEP = async (req, res) => {
  try {
    const { id } = req.params;

    const albums = await ArtistService.getListDiscographyEP(id);
    console.log(albums);

    res
      .status(200)
      .json(helperFunc.successResponse(true, "List Ep discography", albums));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getListDiscographyCollection = async (req, res) => {
  try {
    const { id } = req.params;

    const albums = await ArtistService.getListDiscographyCollection(id);

    res
      .status(200)
      .json(helperFunc.successResponse(true, "List collection discography", albums));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getListDiscographyHave = async (req, res) => {
  try {
    const { id } = req.params;

    const albums = await ArtistService.getListDiscographyHave(id);

    res
      .status(200)
      .json(helperFunc.successResponse(true, "List have discography", albums));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getListPopularArtistDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const albums = await ArtistService.getListPopularArtistDetail(id);
    res
      .status(200)
      .json(
        helperFunc.successResponse(
          true,
                   "Get list popular artist detail",
          albums
        )
      );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getListFansAlsoLike = async (req, res) => {
  try {
    const { id } = req.params;

    const albums = await ArtistService.getListFansAlsoLike(id);

    res
      .status(200)
      .json(
        helperFunc.successResponse(
          true,
          "Get list fans also like artist detail",
          albums
        )
      );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const getAlbumArtistDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const albums = await ArtistService.getAlbumArtistDetail(id);

    res
      .status(200)
      .json(
        helperFunc.successResponse(
          true,
          "Get album artist detail",
          albums
        )
      );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTopArtist = async (req, res) => {
  try {
    const artists = await ArtistService.getTopArtist();

    res
      .status(200)
      .json(helperFunc.successResponse(true, "Top album", artists));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPopularArtists = asyncHandler(async (req, res) => {
  try {
    const artists = await ArtistService.getPopularArtists(req.query);
    res
      .status(200)
      .json(
        helperFunc.successResponse(
          true,
          "Popular artists query successful",
          artists
        )
      );
  } catch (error) {
    res.status(404).json(helperFunc.errorResponse(false, error.message));
  }
});

export default {
  getListArtists,
  getArtist,
  getListDiscographyAlbum,
  getListDiscographyEP,
  getListDiscographyCollection,
  getListDiscographyHave,
  getListPopularArtistDetail,
  getListFansAlsoLike,
  getAlbumArtistDetail,
  getTopArtist,
  getPopularArtists,
}



