import Song from "../models/song.schema.js";
import helperFunc from "../utils/helperFunc.js";

class SongService {
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

  async getPopularSongs({ page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);

    const songs = await Song.find()
      .sort({ like_count: -1 })
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
