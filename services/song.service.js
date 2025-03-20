import mongoose from "mongoose";
import Song from "../models/song.schema.js";

const getTopSong = async () => {
  try {
    // Query albums and populate with artist information
    const songs = await Song.find({})
      .select("_id title image_url artist_ids")
      .populate("artist_ids", "name")
      .sort({ like_count: -1 });
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
  getTopSong,
  
};
