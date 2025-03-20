import mongoose from "mongoose";
const Schema = mongoose.Schema;

const artistSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    bio: {
      type: String,
      default: "",
    },
    avatar_url: {
      type: String,
      default: "",
    },
    followers: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "Artist",
  }
);

artistSchema.set("strict", true);

const Artist = mongoose.model("Artist", artistSchema);
export default Artist;
