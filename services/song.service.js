import mongoose from "mongoose";
import Song from "../models/song.schema.js";
import Artist from "../models/artist.schema.js";
import Playlist from "../models/playlist.schema.js";
import helperFunc from "../utils/helperFunc.js";

class SongService {
  getTopSong = async () => {
    try {
      const songs = await Song.find({})
        .select("_id title image_url singer_ids play_count")
        .populate({
          path: "singer_ids",
          model: Artist,
          select: "name",
        })
        .sort({ play_count: -1 })
        .limit(10);
      return songs.map((song) => ({
        _id: song._id,
        title: song.title,
        artist_name: song.singer_ids.map((artist) => artist.name),
        image_url: song.image_url,
      }));
    } catch (error) {
      throw error;
    }
  };
  getMostSong = async () => {
    try {
      return await Song.findOne({}, "_id title image_url play_count").sort({
        play_count: -1,
      });
    } catch (error) {
      throw new Error("Get most song failed");
    }
  };
  async getSongById(id) {
    const song = await Song.findById(id)
      .populate("singer_ids", "name bio avatar_url followers")
      .populate("author_ids", "name bio avatar_url followers")
      .populate("genre_ids", "name description image_url createdAt")
      .lean();

    if (!song) {
      throw new Error("Song not found");
    }

    // Transform to match the Java class structure
    return this.transformSongData(song);
  }

  async getPopularSongs(playlistId, { limit = 10 } = {}) {
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

  async getNewSongs({ page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);

    const songs = await Song.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .populate("singer_ids", "name bio avatar_url followers")
      .populate("author_ids", "name bio avatar_url followers")
      .populate("genre_ids", "name description image_url createdAt")
      .lean();

    const total = await Song.countDocuments();
    const totalPages = Math.ceil(total / parsedLimit);

    // Transform each song to match the Java class structure
    const transformedSongs = songs.map((song) => this.transformSongData(song));

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
      items: transformedSongs,
    };
  }

  async getRandomSongs({ limit = 10 }) {
    const parsedLimit = parseInt(limit);

    const songs = await Song.aggregate([{ $sample: { size: parsedLimit } }]);

    // Need to populate after aggregation
    const populatedSongs = await Song.populate(songs, [
      { path: "singer_ids", select: "name bio avatar_url followers" },
      { path: "author_ids", select: "name bio avatar_url followers" },
      { path: "genre_ids", select: "name description image_url createdAt" },
    ]);

    // Transform each song to match the Java class structure
    const transformedSongs = populatedSongs.map((song) =>
      this.transformSongData(song)
    );

    // For random songs, we'll return a list format
    return {
      total: transformedSongs.length,
      page: 1,
      limit: parsedLimit,
      totalPages: 1,
      items: transformedSongs,
    };
  }

  // Helper function to transform MongoDB document to Java class format
  transformSongData(song) {
    const transformed = {
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

    return transformed;
  }
}

export default new SongService();
