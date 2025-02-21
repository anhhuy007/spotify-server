import asyncHandler from "express-async-handler";
import helperFunc from "../utils/helperFunc.js";
import AlbumService from "../services/album.service.js";

const getPopularAlbums = asyncHandler(async (req, res) => {
  const response = await AlbumService.getPopularAlbums(req.query);
  res
    .status(200)
    .json(
      helperFunc.successResponse(true, "Popular albums retrieved", response)
    );
});

const getNewAlbums = asyncHandler(async (req, res) => {
  const response = await AlbumService.getNewAlbums(req.query);
  res
    .status(200)
    .json(helperFunc.successResponse(true, "New albums retrieved", response));
});

const getAlbumsWithFilter = asyncHandler(async (req, res) => {
  const response = await AlbumService.getAlbumsWithFilter(req.query);
  res
    .status(200)
    .json(
      helperFunc.successResponse(true, "Albums retrieved with filter", response)
    );
});

export default {
  getPopularAlbums,
  getNewAlbums,
  getAlbumsWithFilter,
};
