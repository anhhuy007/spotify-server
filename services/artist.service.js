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
      console.log(artistId);
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
      return await Artist.find({}, "_id name avatar_url followers ");
    } catch (error) {
      throw new Error("Get top artist failed");
    }
  };
}

export default new ArtistService();
