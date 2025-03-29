import asyncHandler from "express-async-handler";
import helperFunc from "../utils/helperFunc.js";
import GenreService from "../services/genre.service.js";

const getGenres = asyncHandler(async (req, res) => {
  try {
    const response = await GenreService.getGenres(req.query);
    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "Genres retrieved", response)
      );
  } catch (error) {
    console.log("Get genres error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to get genres"));
  }
});
export default{
    getGenres,
}