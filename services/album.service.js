import Album from "../models/album.schema.js";
import Artist from "../models/artist.schema.js";
import Song from "../models/song.schema.js";
import helperFunc from "../utils/helperFunc.js";

class AlbumService {
  cleanedAlbumData(albums) {
    return albums.map(({ artist_ids, song_ids, ...rest }) => ({
      ...rest,
      artist: artist_ids.map(({ name }) => name),
    }));
  }

  async getPopularAlbums(options = {}) {
    const { page, limit, filter } =
      helperFunc.validatePaginationOptions(options);
    const skip = (page - 1) * limit;
    const total = await Album.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    const baseQuery = { ...filter };
    const albums = await Album.find(baseQuery)
      .sort({ like_count: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "artist_ids",
        model: "Artist",
        select: "name",
      })
      .lean();

    return {
      total,
      page,
      limit,
      totalPages,
      items: this.cleanedAlbumData(albums),
    };
  }

  async getNewAlbums(options = {}) {
    const { page, limit, filter } =
      helperFunc.validatePaginationOptions(options);
    const skip = (page - 1) * limit;
    const total = await Album.countDocuments();
    const totalPages = Math.ceil(total / limit);

    const baseQuery = { ...filter };
    const albums = await Album.find(baseQuery)
      .sort({ release_date: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "artist_ids",
        model: "Artist",
        select: "name",
      })
      .lean();

    return {
      total,
      page,
      limit,
      totalPages,
      items: this.cleanedAlbumData(albums),
    };
  }

  async getAlbumsWithFilter(options = {}) {
    const {
      page = 1,
      limit = 10,
      title = "",
      artist = "",
      song = "",
      sortBy = "",
      sortOrder = "asc",
    } = options;

    const parsedPage = Math.max(parseInt(page), 1);
    const parsedLimit = Math.max(parseInt(limit), 1);
    const skip = (parsedPage - 1) * parsedLimit;

    let query = Album.find();

    // filter by album title
    if (title) {
      query = query.where("title", new RegExp(title, "i"));
    }

    // populate artist and filter by artist name
    if (artist) {
      const artistQuery = { name: new RegExp(artist, "i") };
      const matchingArtists = await Artist.find(artistQuery, "_id");
      const artistIds = matchingArtists.map((artist) => artist._id);
      query = query.where("artist_ids").in(artistIds);
    }

    // populate song and filter by song title
    if (song) {
      const songQuery = { title: new RegExp(song, "i") };
      const matchingSongs = await Song.find(songQuery, "_id");
      const songIds = matchingSongs.map((song) => song._id);
      query = query.where("song_ids").in(songIds);
    }

    query = query
      .populate({
        path: "artist_ids",
        select: "name avatar_url",
      })
      .populate({
        path: "song_ids",
        select: "title image_url",
      });

    // sort by field and order
    const validSortFields = ["title", "release_date", "like_count"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "";
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    if (sortField === "title") {
      query = query
        .collation({ locale: "en" })
        .sort({ [sortField]: sortDirection });
    } else {
      query = query.sort({ [sortField]: sortDirection });
    }

    const total = await Album.countDocuments(query.getQuery());
    query = query.skip(skip).limit(parsedLimit);

    let albums = await query.lean();
    albums = albums
      .filter((album) => { // filter album doesn't have matching artists and songs 
        const hasMatchingArtist = !artist || album.artist_ids.length > 0;
        const hasMatchingSong = !song || album.song_ids.length > 0;

        return hasMatchingArtist && hasMatchingSong;
      })
      .map((album) => ({  // remove duplicate artist
        ...album,
        artist_ids: Array.from(
          new Map(
            album.artist_ids.map((artist) => [artist._id.toString(), artist])
          ).values()
        ),
      }));

    const filteredTotal = albums.length;
    const totalPages = Math.ceil(filteredTotal / parsedLimit);

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
      items: albums,
    };
  }
}

export default new AlbumService();
