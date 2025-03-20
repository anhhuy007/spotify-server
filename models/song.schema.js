import mongoose from "mongoose";
const Schema = mongoose.Schema;

const songSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    lyrics: {
      type: String,
      required: true,
    },
    is_premium: {
      type: Boolean,
      default: false,
    },
    like_count: {
      type: Number,
      default: 0,
    },
    mp3_url: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    singer_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
        required: true,
      },
    ],
    author_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "Artist",
        required: true,
      },
    ],
    genre_ids: [
      {
        type: Schema.Types.ObjectId,
        ref: "Genre",
        required: true,
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "Song",
  }
);

songSchema.set("strict", true);

const Song = mongoose.model("Song", songSchema);
export default Song;
