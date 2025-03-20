import asyncHandler from "express-async-handler";
import helperFunc from "../utils/helperFunc.js";
import ArtistService from "../services/artist.service.js";

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
  getPopularArtists,
};
