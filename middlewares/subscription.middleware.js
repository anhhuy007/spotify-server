import Subscription from "../models/subscription.schema";
import subscriptionService from "../services/subscription.service";

async function isPremiumUser(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id;
    const subscription = await Subscription.findOne({
      userId: userId,
    }).sort({ createdAt: -1 });

    if (!subscription) {
      return res.status(403).json({ message: "No subscription found" });
    }

    // check if subscription is active
    const isActive = await subscriptionService.checkUserSubscription(userId);

    if (!isActive) {
      return res.status(403).json({ message: "Subscription is not active" });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error("Subscription middleware error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function requireSubscriptionPlan(...planTypes) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id;
    const subscription = await Subscription.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!subscription) {
      return res.status(403).json({ message: "No subscription found" });
    }

    // check if subscription is active
    const isActive = await subscriptionService.checkUserSubscription(userId);

    if (!isActive) {
      return res.status(403).json({ message: "Subscription is not active" });
    }

    // check if subscription plan matches the required plan type
    if (!planTypes.includes(subscription.subscriptionType)) {
      return res
        .status(403)
        .json({ message: `Forbidden: Requires ${planTypes} plan` });
    }

    req.subscription = subscription;
    next();
  };
}

async function authorizeSubscriptionPlan(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user._id;
    const subscription = await Subscription.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!subscription) {
      return res.status(403).json({ message: "No subscription found" });
    }

    // check if subscription is active
    const isActive = await subscriptionService.checkUserSubscription(userId);

    if (!isActive) {
      return res.status(403).json({ message: "Subscription is not active" });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error("Subscription middleware error: ", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export default { isPremiumUser, requireSubscriptionPlan };
