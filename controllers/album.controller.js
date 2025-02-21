import asyncHandler from "express-async-handler";
import helperFunc from "../utils/helperFunc.js";
import AlbumService from "../services/album.service.js";

const getPopularAlbums = asyncHandler(async (req, res) => {
  try {
    const response = await AlbumService.getPopularAlbums(req.query);
    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "Popular albums retrieved", response)
      );
  } catch (error) {
    res
      .status(500)
      .json(helperFunc.errorResponse(false, "Failed to get popular albums"));
  }
});

const getNewAlbums = asyncHandler(async (req, res) => {
  try {
    const response = await AlbumService.getNewAlbums(req.query);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "New albums retrieved", response));
  } catch (error) {
    res
      .status(500)
      .json(helperFunc.errorResponse(false, "Failed to get new albums"));
  }
});

const getAlbumsWithFilter = asyncHandler(async (req, res) => {
  try {
    const response = await AlbumService.getAlbumsWithFilter(req.query);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "Albums retrieved", response));
  } catch (error) {
    res
      .status(500)
      .json(helperFunc.errorResponse(false, "Failed to get albums"));
  }
});

const getAlbumById = asyncHandler(async (req, res) => {
  try {
    const response = await AlbumService.getAlbumById(req.params.id);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "Album retrieved", response));
  } catch (error) {
    res
      .status(500)
      .json(helperFunc.errorResponse(false, "Failed to get album"));
  }
});

export default {
  getPopularAlbums,
  getNewAlbums,
  getAlbumsWithFilter,
  getAlbumById,
};
