import asyncHandler from "express-async-handler";
import PlaylistService from "../services/playlist.service.js";
import helperFunc from "../utils/helperFunc.js";

const getTopPlaylists = async (req, res) => {
  try {
    const playlists = await PlaylistService.getTopPlaylists();

    res
      .status(200)
      .json(helperFunc.successResponse(true, "Top playlists", playlists));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPopularPlaylists = asyncHandler(async (req, res) => {
  try {
    const response = await PlaylistService.getPopularPlaylists(req.query);
    res
      .status(200)
      .json(
        helperFunc.successResponse(
          true,
          "Popular playlists retrieved",
          response
        )
      );
  } catch (error) {
    console.log("Get popular playlists error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to get popular playlists"));
  }
});

const getNewPlaylists = asyncHandler(async (req, res) => {
  try {
    const response = await PlaylistService.getNewPlaylists(req.query);
    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "New playlists retrieved", response)
      );
  } catch (error) {
    console.log("Get new playlists error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to get new playlists"));
  }
});

const getPlaylistsWithFilter = asyncHandler(async (req, res) => {
  try {
    const response = await PlaylistService.getPlaylistsWithFilter(req.query);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "Playlists retrieved", response));
  } catch (error) {
    console.log("Get playlists with filter error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to get playlists"));
  }
});

// const getPlaylistById = asyncHandler(async (req, res) => {
//   try {
//     const response = await PlaylistService.getPlaylistById(req.params.id);
//     res
//       .status(200)
//       .json(helperFunc.successResponse(true, "Playlist retrieved", response));
//   } catch (error) {
//     console.log("Get playlist by id error: ", error);
//     res
//       .status(400)
//       .json(helperFunc.errorResponse(false, "Failed to get playlist"));
//   }
// });

// const getPlaylistSongs = asyncHandler(async (req, res) => {
//   try {
//     const response = await PlaylistService.getPlaylistSongs(
//       req.params.id,
//       req.query
//     );
//     res
//       .status(200)
//       .json(
//         helperFunc.successResponse(true, "Playlist songs retrieved", response)
//       );
//   } catch (error) {
//     console.log("Get playlist songs error: ", error);
//     res
//       .status(400)
//       .json(helperFunc.errorResponse(false, "Failed to get playlist songs"));
//   }
// });

const createPlaylist = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user info is available from auth middleware
    const response = await PlaylistService.createPlaylist({
      ...req.body,
      owner_id: userId,
    });
    res
      .status(201)
      .json(
        helperFunc.successResponse(
          true,
          "Playlist created successfully",
          response
        )
      );
  } catch (error) {
    console.log("Create playlist error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to create playlist"));
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user info is available from auth middleware
    const playlistId = req.params.id;
    const response = await PlaylistService.updatePlaylist(
      playlistId,
      userId,
      req.body
    );
    res
      .status(200)
      .json(
        helperFunc.successResponse(
          true,
          "Playlist updated successfully",
          response
        )
      );
  } catch (error) {
    console.log("Update playlist error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to update playlist"));
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user info is available from auth middleware
    const playlistId = req.params.id;
    const response = await PlaylistService.deletePlaylist(playlistId, userId);
    res
      .status(200)
      .json(
        helperFunc.successResponse(
          true,
          "Playlist deleted successfully",
          response
        )
      );
  } catch (error) {
    console.log("Delete playlist error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to delete playlist"));
  }
});

// const addSongToPlaylist = asyncHandler(async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { playlistId, songId } = req.params;
//     const response = await PlaylistService.addSongToPlaylist(
//       playlistId,
//       songId,
//       userId
//     );
//     res
//       .status(200)
//       .json(
//         helperFunc.successResponse(true, "Song added to playlist", response)
//       );
//   } catch (error) {
//     console.log("Add song to playlist error: ", error);
//     res
//       .status(400)
//       .json(helperFunc.errorResponse(false, "Failed to add song to playlist"));
//   }
// });

// const removeSongFromPlaylist = asyncHandler(async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const { playlistId, songId } = req.params;
//     const response = await PlaylistService.removeSongFromPlaylist(
//       playlistId,
//       songId,
//       userId
//     );
//     res
//       .status(200)
//       .json(
//         helperFunc.successResponse(true, "Song removed from playlist", response)
//       );
//   } catch (error) {
//     console.log("Remove song from playlist error: ", error);
//     res
//       .status(400)
//       .json(
//         helperFunc.errorResponse(false, "Failed to remove song from playlist")
//       );
//   }
// });

const getUserPlaylists = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const response = await PlaylistService.getUserPlaylists(userId, req.query);
    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "User playlists retrieved", response)
      );
  } catch (error) {
    console.log("Get user playlists error: ", error);
    res
      .status(400)
      .json(helperFunc.errorResponse(false, "Failed to get user playlists"));
  }
});

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
  getTopPlaylists,
  getPopularPlaylists,
  getNewPlaylists,
  getPlaylistsWithFilter,
  getPlaylistById,
  getPlaylistSongs,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  getUserPlaylists,

  getUserPlaylist,
  createNewPlaylist,
  addSongToPlaylist,
  getPlaylistById,
  getPlaylistSongs,
  removeSongFromPlaylist,
  updatePlaylistInfo,
};
