import Artist from "../models/artist.schema.js";
import helperFunc from "../utils/helperFunc.js";

class ArtistService {
  async getPopularArtists(options = {}) {
    const { page, limit, filter } =
      helperFunc.validatePaginationOptions(options);
    const skip = (page - 1) * limit;
    const total = await Artist.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const artists = await Artist.find()
      .sort({ followers: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      total,
      page,
      limit,
      totalPages,
      items: artists,
    };
  }
}

export default new ArtistService();
