import asyncHandler from "express-async-handler";
import FollowerService from "../services/follower.service.js";
import helperFunc from "../utils/helperFunc.js";

const checkFollowerExists = asyncHandler(async (req, res) => {
  const { user_id, artist_id } = req.body;
  try {
    const follower = await FollowerService.exists(user_id, artist_id);
    res.status(200).json(
      helperFunc.successResponse(
        !!follower,
        follower
          ? "User follows the artist"
          : "User does not follow the artist",
        {
          _id: follower ? follower._id : null,
          user_id,
          artist_id,
        }
      )
    );
  } catch (error) {
    res
      .status(500)
      .json(helperFunc.errorResponse(false, "Failed to check follow status"));
  }
});

const addFollower = asyncHandler(async (req, res) => {
  const { user_id, artist_id } = req.body;
  try {
    const follower = await FollowerService.addFollower(user_id, artist_id);
    if (follower) {
      res.status(201).json(
        helperFunc.successResponse(true, "Followed successfully", {
          _id: follower._id,
          user_id: follower.user_id,
          artist_id: follower.artist_id,
        })
      );
    } else {
      res.status(400).json(helperFunc.errorResponse(false, "Already followed"));
    }
  } catch (error) {
    res.status(500).json(helperFunc.errorResponse(false, "Failed to follow"));
  }
});



const deleteFollower = asyncHandler(async (req, res) => {
  try {
    const result = await FollowerService.deleteById(req.params.id);
    if (result) {
      res
        .status(200)
        .json(helperFunc.successResponse(true, "Unfollowed successfully"));
    } else {
      res
        .status(404)
        .json(helperFunc.errorResponse(false, "Follower not found"));
    }
  } catch (error) {
    res.status(500).json(helperFunc.errorResponse(false, "Failed to unfollow"));
  }
});



const getFollowedArtists = asyncHandler(async (req, res) => {
  try {
    const followedArtists = await FollowerService.getFollowedArtists(
      req.user._id
    );
    res
      .status(200)
      .json(
        helperFunc.successResponse(
          true,
          "Followed artists retrieved",
          followedArtists
        )
      );
  } catch (error) {
    res
      .status(500)
      .json(
        helperFunc.errorResponse(false, "Failed to retrieve followed artists")
      );
  }
});

const getCountFollowedArtists = asyncHandler(async (req, res) => {
  try {
    const count = await FollowerService.getCountFollowedArtists(
      req.params.user_id
    );
    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "Followed artists count retrieved", {
          count,
        })
      );
  } catch (error) {
    res
      .status(500)
      .json(helperFunc.errorResponse(false, "Failed to retrieve count"));
  }
});



export default {
  addFollower,
  getFollowedArtists,
  getCountFollowedArtists,
  deleteFollower,
  checkFollowerExists,
};
