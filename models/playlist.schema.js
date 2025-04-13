import mongoose from "mongoose";
const Schema = mongoose.Schema;

const playlistSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    cover_url: {
      type: String,
      default: "",
    },
    owner_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    song_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "Song",
        required: true,
      },
    ],
    is_public: {
      type: Boolean,
      default: true,
    },
    like_count: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "Playlist",
  }
);

playlistSchema.set("strict", true);

const Playlist = mongoose.model("Playlist", playlistSchema);
export default Playlist;
