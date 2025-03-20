import mongoose from "mongoose";
const Schema = mongoose.Schema;

const SubscriptionType = {
  MINI: "mini",
  INDIVIDUAL: "individual",
  STUDENT: "student",
};

const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscriptionType: {
      type: String,
      enum: Object.values(SubscriptionType),
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "Subscription",
  }
);

const Subscription = mongoose.model("Subscription", SubscriptionSchema);
export default Subscription;
