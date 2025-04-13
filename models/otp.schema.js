import mongoose from "mongoose";
const Schema = mongoose.Schema;

const otpSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiry: {
      type: Date,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    }
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "OTP",
  }
);

otpSchema.set("strict", true);

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
