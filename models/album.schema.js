import mongoose from "mongoose";
const Schema = mongoose.Schema;

const albumSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    release_date: {
      type: Date,
      default: null,
    },
    like_count: {
      type: Number,
      default: 0,
    },
    play_count: {
      type: Number,
      default: 0
    },
    cover_url: {
      type: String,
      default: "",
    },
    artist_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
        required: true,
      },
    ],
    song_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "Song",
        required: true,
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "Album",
  }
);

albumSchema.set("strict", true);

const Album = mongoose.model("Album", albumSchema);
export default Album;
