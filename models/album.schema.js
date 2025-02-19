import mongoose from "mongoose";
const Schema = mongoose.Schema;

const albumSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artist_ids: {
      type: [String],
      required: true,
    },
    release_date: {
      type: Date,
      default: null,
    },
    like_count: { 
        type: Number,
        default: 0
    },
    cover_url: {
      type: String,
      default: "",
    },
    song_ids: {
      type: [String],
      required: true,
    },
    create_at: {
      type: Date,
    },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "Album",
  }
);

// Remove any fields not in schema during transformation
albumSchema.set("strict", true);

const Album = mongoose.model("Album", albumSchema);
export default Album;
