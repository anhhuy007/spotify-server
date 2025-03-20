import mongoose from "mongoose";
import Album from "../models/album.schema.js";
import Artist from "../models/artist.schema.js";

const getTopAlbum = async () => {
  try {
    return await Album.find({}, "_id title cover_url like_count ");
  } catch (error) {
    throw new Error("Get top album failed");
  }
};

const getAlsoLike = async () => {
  try {
    // Query albums and populate with artist information
    const albums = await Album.find({})
      .select("_id title cover_url artist_ids")
      .populate({
        path: "artist_ids",
        model: Artist,
        select: "name",
      });
    // .sort({ like_count: -1 })
    console.log(albums);
    return albums.map((album) => ({
      _id: album._id,
      title: album.title,
      artist_name: album.artist_ids.map((artist) => artist.name),
      cover_url: album.cover_url,
    }));
  } catch (error) {
    throw new Error("Get also like recommendations failed");
  }
};

export default {
  getTopAlbum,
  getAlsoLike,
};
