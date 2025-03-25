import mongoose from "mongoose";
const Schema = mongoose.Schema;

const followerSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      require: true,
    },
    artist_id: {
      type: Schema.Types.ObjectId,
      ref: "Artist",
      require: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "Follower",
  }
);

followerSchema.set("strict", true);

const Follower = mongoose.model("Follower", followerSchema);
export default Follower;
