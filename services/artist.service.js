import mongoose from "mongoose";
import Artist from "../models/Artist.schema.js";
import Song from "../models/Song.schema.js";
import Album from "../models/album.schema.js";

const getListArtists = async (start, end) => {
  try {
    const limit = end - start;
    return await Artist.find({}, "_id name bio avatar_url")
      .skip(start)
      .limit(limit);
  } catch (error) {
    throw new Error("Failed to fetch artists");
  }
};

const getArtist = async (id) => {
  try {
    return await Artist.findById(id, "_id name bio followers avatar_url");
  } catch (error) {
    throw new Error("Failed to fetch artists");
  }
};

const getListDiscographyAlbum = async (artistId) => {
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

const getAlbumArtistDetail = async (artistId) => {
  try {

    return await Album.findOne(
      { artist_ids: artistId },
      "_id title cover_url create_at"
    );
  } catch (error) {
    throw new Error("Get album detail by artistId failed");
  }
};


const getListDiscographyEP = async (artistId) => {
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

const getListDiscographyCollection = async (artistId) => {
  try {
    return await Album.find(
      { artist_ids: { $in: [artistId] } },
      "_id title cover_url create_at "
    );
  } catch (error) {
    throw new Error("Get album by artistId failed");
  }
};

const getListDiscographyHave = async (artistId) => {
  try {
    return await Song.find(
      { singer_ids: { $in: [artistId] } },
      "_id title image_url create_at "
    );
  } catch (error) {
    throw new Error("Get song by artistId failed");
  }
};

const getListPopularArtistDetail = async (artistId) => {
  try {
    return await Song.find(
      { singer_ids: { $in: [artistId] } },
      "_id title image_url like_count "
    );
  } catch (error) {
    throw new Error("Get list popular artist detail");
  }
};

const getListFansAlsoLike = async (artistId) => {
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


export default {
  getListArtists,
  getArtist,
  getListDiscographyAlbum,
  getListDiscographyEP,
  getListDiscographyCollection,
  getListDiscographyHave,
  getListPopularArtistDetail,
  getListFansAlsoLike,
  getAlbumArtistDetail,
};
