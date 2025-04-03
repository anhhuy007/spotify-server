import helperFunc from "../utils/helperFunc.js";
import mongoose from "mongoose";
import Artist from "../models/artist.schema.js";
import User from "../models/user.schema.js";
import Follower from "../models/follower.schema.js";

class FollowerService {
  exists = async (user_id, artist_id) => {
    const follower = await Follower.findOne({ user_id, artist_id })
      .select("_id user_id artist_id")
      .lean();
    return follower;
  };

  addFollower = async (user_id, artist_id) => {
    let follower = await this.exists(user_id, artist_id);
    if (!follower) {
      follower = await Follower.create({ user_id, artist_id });
    }
    return {
      _id: follower._id,
      user_id: follower.user_id,
      artist_id: follower.artist_id,
    };
  };

  getCountFollowedArtists = async (user_id) => {
    return await Follower.countDocuments({ user_id });
  };

  getFollowedArtists = async (user_id) => {
    return await Follower.find({ user_id })
      .select("_id user_id artist_id")
      .lean();
  };

  deleteById = async (_id) => {
    return await Follower.findByIdAndDelete(_id);
  };
}


export default new FollowerService();
