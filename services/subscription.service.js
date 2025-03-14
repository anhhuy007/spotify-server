import Subscription from "../models/subscription.schema.js";

class SubscriptionService {
  async createSubscription(userId, startDate, endDate, subscriptionType) {
    if (!userId || !startDate || !endDate || !subscriptionType) {
      throw new Error("Missing required fields");
    }

    if (startDate > endDate) {
      throw new Error("Start date cannot be greater than end date");
    }

    if (
      subscriptionType !== "mini" &&
      subscriptionType !== "individual" &&
      subscriptionType !== "student"
    ) {
      throw new Error("Invalid subscription type");
    }

    const subscription = new Subscription({
      userId,
      startDate,
      endDate,
      subscriptionType,
    });

    return subscription.save();
  }

  async checkUserSubscription(userId) {
    if (!userId) {
      throw new Error("Missing required fields");
    }

    const subscription = await Subscription.findOne({ userId }).sort({
      createdAt: -1,
    });

    // check if subscription is active
    if (subscription && subscription.endDate > new Date()) {
      return subscription;
    }

    // if subscription is not active, set isActive to false
    subscription.isActive = false;
    await subscription.save();

    return null;
  }

  async cancelSubscription(userId) {
    if (!userId) {
      throw new Error("Missing required fields");
    }

    const subscription = await Subscription.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!subscription) {
      throw new Error("No subscription found");
    }

    subscription.isActive = false;
    await subscription.save();

    return subscription;
  }

  async getUserSubscription(userId) {
    if (!userId) {
      throw new Error("Missing required fields");
    }

    return Subscription.findOne({ userId }).sort({ createdAt: -1 });
  }

  async getAllUserSubscriptions(userId, options = {}) {
    if (!userId) {
      throw new Error("Missing required fields");
    }

    const { limit = 10, page = 1 } = options;

    const subscriptions = await Subscription.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Subscription.countDocuments({ userId });
    const totalPages = Math.ceil(total / limit);

    return {
      total,
      page,
      limit,
      totalPages,
      items: subscriptions,
    };
  }
}

export default new SubscriptionService();
