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
      const { id, name, image } = options;
      console.log("Create new playlist with options: ", options);
      const newPlaylist = new Playlist({
        name,
        cover_url: image,
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

  transformSongData(song) {
    console.log("Transforming song:", song);
    return {
      _id: song._id?.toString() || "",
      title: song.title || "Unknown",
      lyrics: song.lyrics || "",
      is_premium: song.is_premium || false,
      like_count: song.like_count || 0,
      mp3_url: song.mp3_url || "",
      image_url: song.image_url || "",
      singers: (song.singer_ids || []).map((singer) => ({
        _id: singer._id?.toString() || "",
        name: singer.name || "Unknown",
        bio: singer.bio || "",
        avatar_url: singer.avatar_url || "",
        followers: singer.followers || 0,
      })),
      authors: (song.author_ids || []).map((author) => ({
        _id: author._id?.toString() || "",
        name: author.name || "Unknown",
        bio: author.bio || "",
        avatar_url: author.avatar_url || "",
        followers: author.followers || 0,
      })),
      genres: (song.genre_ids || []).map((genre) => ({
        _id: genre._id?.toString() || "",
        name: genre.name || "Unknown",
        description: genre.description || "",
        image_url: genre.image_url || "",
        create_at: genre.createdAt || new Date(),
      })),
    };
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

    // Fetch the playlist and populate the song_ids field
    const playlist = await Playlist.findById(playlistId).populate("song_ids");
    if (!playlist) {
      console.error("Playlist not found:", playlistId);
      return { success: false, message: "Playlist not found", status: 404 };
    }

    const totalSongs = playlist.song_ids.length;
    const totalPages = Math.ceil(totalSongs / limitNum);
    const startIndex = (pageNum - 1) * limitNum;

    // Slice the song_ids for pagination (already populated)
    const songDocsToTransform = playlist.song_ids.slice(
      startIndex,
      startIndex + limitNum
    );

    // Populate nested fields manually since .populate("song_ids") doesn't deeply populate
    const populatedSongs = await Promise.all(
      songDocsToTransform.map((songDoc) =>
        songDoc
          .populate([
            {
              path: "singer_ids",
              select: "name bio avatar_url followers",
            },
            {
              path: "author_ids",
              select: "name bio avatar_url followers",
            },
            {
              path: "genre_ids",
              select: "name description image_url",
            },
          ])
          .then((populated) => populated)
      )
    );

    if (!populatedSongs || populatedSongs.length === 0) {
      console.error("No songs found in playlist after slicing.");
      return {
        total: totalSongs,
        limit: limitNum,
        page: pageNum,
        totalPages,
        items: [],
      };
    }

    // Transform the song data
    const transformedSongs = populatedSongs.map((song) => {
      return this.transformSongData(song);
    });

    return {
      total: totalSongs,
      limit: limitNum,
      page: pageNum,
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
  async removePlaylist(playlistId) {
    return Playlist.findByIdAndDelete(playlistId);
  }
  async getRandomSongs(playlistId, { limit = 10 } = {}) {
    const parsedLimit = parseInt(limit);

    // Lấy danh sách song_ids từ playlist
    const playlist = await Playlist.findById(playlistId)
      .select("song_ids")
      .lean();
    const excludedSongIds = playlist ? playlist.song_ids : [];

    // Sử dụng MongoDB Aggregation để lấy bài hát ngẫu nhiên, loại trừ các bài hát trong playlist
    const songs = await Song.aggregate([
      { $match: { _id: { $nin: excludedSongIds } } }, // Loại trừ các bài hát trong playlist
      { $sample: { size: parsedLimit } }, // Lấy ngẫu nhiên limit bài hát
    ]);

    // Populate dữ liệu sau khi sử dụng aggregation
    const populatedSongs = await Song.populate(songs, [
      { path: "singer_ids", select: "name bio avatar_url followers" },
      { path: "author_ids", select: "name bio avatar_url followers" },
      { path: "genre_ids", select: "name description image_url createdAt" },
    ]);

    // Transform each song to match the Java class structure
    const transformedSongs = populatedSongs.map((song) =>
      this.transformSongData(song)
    );

    return {
      total: transformedSongs.length,
      page: 1,
      limit: parsedLimit,
      totalPages: 1,
      items: transformedSongs,
    };
  }
}
export default new PlaylistService();
