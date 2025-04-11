import express from "express";
import followerController from "../controllers/follower.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post(
  "/check",
  authMiddleware.authenticateUser,
  followerController.checkFollowerExists
);

router.post(
  "/add",
  authMiddleware.authenticateUser,
  followerController.addFollower
);

router.post(
  "/delete",
  authMiddleware.authenticateUser,
  followerController.deleteFollower1
);
router.get(
  "/listArtist",
  authMiddleware.authenticateUser,
  followerController.getAllArtistsWithFollowStatus
);
router.get(
  "/list",
  authMiddleware.authenticateUser,
  followerController.getFollowedArtists
);
router.get(
  "/:user_id/count",
  authMiddleware.authenticateUser,
  followerController.getCountFollowedArtists
);
router.delete(
  "/delete/:id",
  authMiddleware.authenticateUser,
  followerController.deleteFollower
);



export default router;
