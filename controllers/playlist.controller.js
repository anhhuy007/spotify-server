import asyncHandler from "express-async-handler";
import PlaylistService from "../services/playlist.service.js";
import helperFunc from "../utils/helperFunc.js";
const getUserPlaylist = asyncHandler(async (req, res) => {
  try {
    const response = await PlaylistService.getUserPlaylist(req.user, req.query);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "Playlist retrieved", response));
  } catch (error) {
    console.log("Get playlist error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to get user playlist"));
  }
});
const createNewPlaylist = asyncHandler(async (req, res) => {
  try {
    const response = await PlaylistService.createNewPlaylist(
      req.user,
      req.body
    );
    res
      .status(200)
      .json(helperFunc.successResponse(true, "Playlist create", response));
  } catch (error) {
    console.log("Post playlist error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to create user playlist"));
  }
});
const addSongToPlaylist = asyncHandler(async (req, res) => {
  try {
    const response = await PlaylistService.addSongToPlaylist(req.body);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "Playlist create", response));
  } catch (error) {
    console.log("Post playlist error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to create user playlist"));
  }
});
const getPlaylistById = asyncHandler(async (req, res) => {
  try {
    const response = await PlaylistService.getPlaylistById(req.params.id);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "Playlist retrieved", response));
  } catch (error) {
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to get user playlist"));
  }
});
const getPlaylistSongs = asyncHandler(async (req, res) => {
  try {
    const response = await PlaylistService.getPlaylistSongs(
      req.params.id,
      req.query
    );
    res
      .status(200)
      .json(helperFunc.successResponse(true, "Playlist retrieved", response));
  } catch (error) {
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to get user playlist"));
  }
});
const removeSongFromPlaylist = asyncHandler(async (req, res) => {
  try {
    const response = await PlaylistService.removeSongFromPlaylist(
      req.params.playlistId,
      req.params.songId
    );
    res
      .status(200)
      .json(helperFunc.successResponse(true, "Song deleted", response));
  } catch (error) {
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to delete song"));
  }
});

const updatePlaylistInfo = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!name && !description) {
      return res.status(400).json({ message: "No updates provided" });
    }

    const updatedPlaylist = await PlaylistService.updatePlaylistInfo(
      playlistId,
      name,
      description
    );

    if (!updatedPlaylist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    return res.json({ message: "Playlist updated", playlist: updatedPlaylist });
  } catch (error) {
    console.error("Error updating playlist:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default {
  getUserPlaylist,
  createNewPlaylist,
  addSongToPlaylist,
  getPlaylistById,
  getPlaylistSongs,
  removeSongFromPlaylist,
  updatePlaylistInfo,
};
