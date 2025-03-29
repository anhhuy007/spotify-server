import helperFunc from "../utils/helperFunc.js";
import mongoose from "mongoose";
import Artist from "../models/artist.schema.js";
import Song from "../models/song.schema.js";
import Album from "../models/album.schema.js";

class ArtistService {
  async getPopularArtists(options = {}) {
    const { page, limit, filter } =
      helperFunc.validatePaginationOptions(options);
    const skip = (page - 1) * limit;
    const total = await Artist.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const artists = await Artist.find()
      .sort({ followers: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      total,
      page,
      limit,
      totalPages,
      items: artists,
    };
  }

  getListArtists = async (start, end) => {
    try {
      const limit = end - start;
      return await Artist.find({}, "_id name bio avatar_url")
        .skip(start)
        .limit(limit);
    } catch (error) {
      throw new Error("Failed to fetch artists");
    }
  };

  getArtist = async (id) => {
    try {
      return await Artist.findById(id, "_id name bio followers avatar_url");
    } catch (error) {
      throw new Error("Failed to fetch artists");
    }
  };

  getListDiscographyAlbum = async (artistId) => {
    try {
      const artistObjectId = mongoose.Types.ObjectId.isValid(artistId)
        ? new mongoose.Types.ObjectId(artistId)
        : artistId;

      return await Album.find(
        { artist_ids: artistId },
        "_id title cover_url create_at "
      );
    } catch (error) {
      throw new Error("Get album by artistId failed");
    }
  };

  getAlbumArtistDetail = async (artistId) => {
    try {
      return await Album.findOne(
        { artist_ids: artistId },
        "_id title cover_url create_at"
      );
    } catch (error) {
      throw new Error("Get album detail by artistId failed");
    }
  };

  getListDiscographyEP = async (artistId) => {
    try {
      return await Song.find(
        { singer_ids: { $in: [artistId] } },
        "_id title image_url create_at "
      );
    } catch (error) {
      throw new Error("Get song by artistId failed");
    }
  };

  getListDiscographyCollection = async (artistId) => {
    try {
      return await Album.find(
        { artist_ids: { $in: [artistId] } },
        "_id title cover_url create_at "
      );
    } catch (error) {
      throw new Error("Get album by artistId failed");
    }
  };

  getListDiscographyHave = async (artistId) => {
    try {
      return await Song.find(
        { singer_ids: { $in: [artistId] } },
        "_id title image_url create_at "
      );
    } catch (error) {
      throw new Error("Get song by artistId failed");
    }
  };

  getListPopularArtistDetail = async (artistId) => {
    try {
      return await Song.find(
        { singer_ids: { $in: [artistId] } },
        "_id title image_url like_count "
      );
    } catch (error) {
      throw new Error("Get list popular artist detail");
    }
  };

  getListFansAlsoLike = async (artistId) => {
    try {
      return await Artist.aggregate([
        { $match: { _id: { $ne: artistId } } },
        { $sample: { size: 10 } },
        { $project: { _id: 1, name: 1, avatar_url: 1 } },
      ]);
    } catch (error) {
      throw new Error("Failed to fetch artists");
    }
  };

  getTopArtist = async () => {
    try {
      return await Artist.find({}, "_id name followers avatar_url")
        .sort({ followers: -1 }) // Sắp xếp giảm dần theo play_count
        .limit(10); // Giới hạn 10 album
    } catch (error) {
      throw new Error("Get top artist failed");
    }
  };
  getMostArtist = async () => {
    try {
      return await Artist.findOne({}, "_id name followers avatar_url").sort({
        followers: -1,
      }); // Sắp xếp giảm dần theo play_count
    } catch (error) {
      throw new Error("Get top artist failed");
    }
  };

  async getArtistSongs(artistId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      const totalSongs = await Song.countDocuments({ singer_ids: artistId });
      const totalPages = Math.ceil(totalSongs / limitNum);
      const startIndex = (pageNum - 1) * limitNum;

      let songs = await Song.find({ singer_ids: artistId })
        .skip(startIndex)
        .limit(limitNum)
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

      const transformedSongs = songs.map((song) =>
        this.transformSongData(song)
      );

      return {
        success: true,
        total: totalSongs,
        limit: limitNum,
        page: pageNum,
        totalPages,
        items: transformedSongs,
      };
    } catch (err) {
      console.error("Error fetching artist songs:", err);
      return { success: false, message: "Server error", status: 500 };
    }
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

export default new ArtistService();
