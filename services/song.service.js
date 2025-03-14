import Song from "../models/song.schema.js";
import helperFunc from "../utils/helperFunc.js";

class SongService {
  cleanSongData(songs) {
    return songs.map(({ singer_ids, author_ids, genre_ids, ...rest }) => ({
      ...rest,
      singers: singer_ids.map(({ name }) => name),
    }));
  }

  async getSongById(id) {
    const song = await Song.findById(id)
      .populate({
        path: "singer_ids",
        select: "name",
      })
      .lean();

    if (!song) throw new Error("Song not found");

    return this.cleanSongData([song])[0];
  }

  async getPopularSongs(options = {}) {
    const { page, limit, filter } =
      helperFunc.validatePaginationOptions(options);
    const skip = (page - 1) * limit;
    const total = await Song.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const songs = await Song.find()
      .sort({ like_count: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "singer_ids",
        model: "Artist",
        select: "name",
      })
      .lean();

    return {
      total,
      page,
      limit,
      totalPages,
      items: this.cleanSongData(songs),
    };
  }

  async getNewSongs(options = {}) {
    const { page, limit, filter } =
      helperFunc.validatePaginationOptions(options);

    const skip = (page - 1) * limit;
    const total = await Song.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const songs = await Song.find()
      .sort({ release_date: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "singer_ids",
        model: "Artist",
        select: "name",
      })
      .lean();

    return {
      total,
      page,
      limit,
      totalPages,
      items: this.cleanSongData(songs),
    };
  }
}

export default new SongService();
