import asyncHandler from "express-async-handler";
import helperFunc from "../utils/helperFunc.js";
import SongService from "../services/song.service.js";
import subscriptionService from "../services/subscription.service.js";

const getSongById = asyncHandler(async (req, res) => {
  try {
    const song = await SongService.getSongById(req.params.id);

    // check subscription plan
    const userSubscription = await subscriptionService.getUserSubscription(
      req.user._id
    );

    let userPlan = "free";
    if (userSubscription) {
      userPlan = userSubscription.subscriptionType;
    }

    // check if user has access without ad
    const requiredPlanTypes = song.planTypes;
    const hasRequiredPlan = requiredPlanTypes.includes(userPlan);

    const shouldPlayAd = !hasRequiredPlan || requiredPlanTypes.includes("free");

    res.status(200).json(
      helperFunc.successResponse(true, "Song query successful", {
        song,
        shouldPlayAd,
      })
    );
  } catch (error) {
    res.status(404).json(helperFunc.errorResponse(false, error.message));
  }
});

const getPopularSongs = asyncHandler(async (req, res) => {
  try {
    const songs = await SongService.getPopularSongs(req.params.id, req.query);

    res
      .status(200)
      .json(
        helperFunc.successResponse(
          true,
          "Popular songs query successful",
          songs
        )
      );
  } catch (error) {
    res.status(404).json(helperFunc.errorResponse(false, error.message));
  }
});

const getNewSongs = asyncHandler(async (req, res) => {
  try {
    const songs = await SongService.getNewSongs(req.query);

    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "New songs query successful", songs)
      );
  } catch (error) {
    res.status(404).json(helperFunc.errorResponse(false, error.message));
  }
});

const getRandomSongs = asyncHandler(async (req, res) => {
  try {
    const { limit } = req.query;
    const songs = await SongService.getRandomSongs({
      limit: parseInt(limit) || 10,
    });

    res
      .status(200)
      .json(helperFunc.successResponse(true, "Random songs fetched", songs));
  } catch (error) {
    res.status(500).json(helperFunc.errorResponse(false, error.message));
  }
});

const getTopSong = async (req, res) => {
  try {
    const songs = await SongService.getTopSong();

    res.status(200).json(helperFunc.successResponse(true, "Top Song", songs));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMostSong = async (req, res) => {
  try {
    const songs = await SongService.getMostSong();

    res.status(200).json(helperFunc.successResponse(true, "Most Song", songs));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getSongById,
  getPopularSongs,
  getNewSongs,
  getRandomSongs,
  getTopSong,
  getMostSong,
};
