import Playlist from "../models/playlist.schema.js";
import helperFunc from "../utils/helperFunc.js";

class PlaylistService {
  async getUserPlaylist(user, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        filter = {},
      } = helperFunc.validatePaginationOptions(options);
      const skip = (page - 1) * limit;
      const total = await Playlist.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      const baseQuery = { ...filter, owner_id: user._id }; // Lọc theo user

      const playlists = await Playlist.find(baseQuery)
        .sort({ likes: -1 })
        .skip(skip)
        .limit(limit);

      return {
        total,
        limit,
        page,
        totalPages,
        items: playlists,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Database query failed");
    }
  }
  async createNewPlaylist(user, options = {}) {
    try {
      const { id, name } = options;
      const newPlaylist = new Playlist({
        name,
        owner_id: user._id, // Gán playlist này cho user đã xác thực
        song_ids: [id], // Thêm bài hát vào danh sách
        like_count: 0,
      });

      await newPlaylist.save();
      return {
        message: "Playlist created",
        playlist: newPlaylist,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Database query failed");
    }
  }

  async addSongToPlaylist({ playlistId, songId }) {
    return Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { song_ids: songId } },
      { new: true }
    );
  }

  async getPlaylistById(id) {
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return { message: "Playlist not found", status: 404 };
    }
    return playlist;
  }
  async getPlaylistSongs(playlistId, query = {}) {
    const { page = 1, limit = 10 } = query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    const playlist = await Playlist.findById(playlistId).populate("song_ids");
    if (!playlist) {
      return { success: false, message: "Playlist not found", status: 404 };
    }

    const totalSongs = playlist.song_ids.length;
    const totalPages = Math.ceil(totalSongs / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const items = playlist.song_ids.slice(startIndex, startIndex + limitNum);

    return {
      total: totalSongs,
      limit: limitNum,
      page: pageNum,
      totalPages,
      items,
    };
  }
  async removeSongFromPlaylist(playlistId, songId) {
    return Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { song_ids: songId } },
      { new: true }
    );
  }

  async updatePlaylistInfo(playlistId, name, description) {
    return Playlist.findByIdAndUpdate(
      playlistId,
      { $set: { name, description } },
      { new: true }
    );
  }
}
export default new PlaylistService();
