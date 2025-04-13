import subscriptionService from "../services/subscription.service.js";
import asyncHandler from "express-async-handler";
import helperFunc from "../utils/helperFunc.js";
import notificationService from "../services/notification.service.js";
import User from "../models/user.schema.js";

const createSubscription = asyncHandler(async (req, res) => {
  const { userId, subscriptionType, startDate, endDate, total, newCharge } =
    req.body;

  try {
    const subscription = await subscriptionService.createSubscription(
      userId,
      startDate,
      endDate,
      subscriptionType,
      total,
      newCharge
    );

    const user = await User.findById(userId);

    // send payment notification & email to announce subscription
    await helperFunc.sendSubscriptionEmail(
      user.username,
      user.email,
      subscription
    );

    await notificationService.sendNotification(
      userId,
      "Subscription",
      "Your subscription has been created successfully"
    );

    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "Subscription created", subscription)
      );
  } catch (error) {
    res
      .status(400)
      .json(
        helperFunc.errorResponse(
          false,
          "Fail to create subscription: " + error.message
        )
      );
  }
});

const checkUserSubscription = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  try {
    const subscription = await subscriptionService.checkUserSubscription(
      userId
    );

    if (subscription) {
      res
        .status(200)
        .json(
          helperFunc.successResponse(true, "Subscription found", subscription)
        );
    } else {
      res
        .status(200)
        .json(helperFunc.successResponse(true, "No active subscription"));
    }
  } catch (error) {
    res
      .status(400)
      .json(
        helperFunc.errorResponse(
          false,
          "Fail to check subscription: " + error.message
        )
      );
  }
});

const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  try {
    const subscription = await subscriptionService.cancelSubscription(userId);

    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "Subscription cancelled", subscription)
      );
  } catch (error) {
    res
      .status(400)
      .json(
        helperFunc.errorResponse(
          false,
          "Fail to cancel subscription: " + error.message
        )
      );
  }
});

const getUserSubscription = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  try {
    const subscription = await subscriptionService.getUserSubscription(userId);

    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "Subscription found", subscription)
      );
  } catch (error) {
    res
      .status(400)
      .json(
        helperFunc.errorResponse(
          false,
          "Fail to get subscription: " + error.message
        )
      );
  }
});

const getAllUserSubscriptions = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  try {
    const subscriptions = await subscriptionService.getAllUserSubscriptions(
      userId
    );

    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "Subscriptions found", subscriptions)
      );
  } catch (error) {
    res
      .status(400)
      .json(
        helperFunc.errorResponse(
          false,
          "Fail to get subscriptions: " + error.message
        )
      );
  }
});

export default {
  createSubscription,
  checkUserSubscription,
  cancelSubscription,
  getUserSubscription,
  getAllUserSubscriptions,
};
