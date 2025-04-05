import Playlist from "../models/playlist.schema.js";
import helperFunc from "../utils/helperFunc.js";
import Song from "../models/song.schema.js";

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
    const startIndex = (pageNum - 1) * limitNum;

    const playlist = await Playlist.findById(playlistId).lean();
    console.log("Playlist:", playlist);
    if (!playlist || !playlist.song_ids || playlist.song_ids.length === 0) {
      return {
        success: false,
        message: "Playlist not found or has no songs",
        status: 404,
      };
    }

    const totalSongs = playlist.song_ids.length;
    const totalPages = Math.ceil(totalSongs / limitNum);
    const paginatedSongIds = playlist.song_ids.slice(
      startIndex,
      startIndex + limitNum
    );

    let songs = await Song.find({ _id: { $in: paginatedSongIds } })
      .populate({
        path: "singer_ids",
        select: "name bio avatar_url followers",
      })
      .populate({
        path: "author_ids",
        select: "name bio avatar_url followers",
      })
      .populate({
        path: "genre_ids",
        select: "name description image_url createdAt",
      });

    songs = paginatedSongIds.map((id) =>
      songs.find((song) => song._id.toString() === id.toString())
    );

    const transformedSongs = songs.map((song) => this.transformSongData(song));

    return {
      total: totalSongs,
      page: pageNum,
      limit: limitNum,
      totalPages,
      items: transformedSongs,
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

  transformSongData(song) {
    return {
      _id: song._id.toString(),
      title: song.title,
      lyric: song.lyrics,
      is_premium: song.is_premium,
      like_count: song.like_count,
      mp3_url: song.mp3_url,
      image_url: song.image_url,
      singers: song.singer_ids.map((singer) => ({
        _id: singer._id.toString(),
        name: singer.name,
        bio: singer.bio || "",
        avatar_url: singer.avatar_url || singer.image_url,
        followers: singer.followers || 0,
      })),
      authors: song.author_ids.map((author) => ({
        _id: author._id.toString(),
        name: author.name,
        bio: author.bio || "",
        avatar_url: author.avatar_url || author.image_url,
        followers: author.followers || 0,
      })),
      genres: song.genre_ids.map((genre) => ({
        _id: genre._id.toString(),
        name: genre.name,
        description: genre.description || "",
        image_url: genre.image_url || "",
        create_at: genre.createdAt || new Date(),
      })),
    };
  }
}
export default new PlaylistService();
