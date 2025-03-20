import Album from "../models/album.schema.js";
import Artist from "../models/artist.schema.js";
import Song from "../models/song.schema.js";
import helperFunc from "../utils/helperFunc.js";

class AlbumService {
  cleanedAlbumData(albums) {
    return albums.map(({ artist_ids, song_ids, ...rest }) => ({
      ...rest,
      artists: artist_ids.map(({ name }) => name),
    }));
  }

  async getPopularAlbums(options = {}) {
    const {
      page = 1,
      limit = 20,
      filter = {},
    } = helperFunc.validatePaginationOptions(options); // default: 20 items per page, filter=null // help server validate invalid input
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
        select: "name avatar_url", //select only name and avatar_url
      })
      .lean();

    const transformedAlbums = albums.map((album) => ({
      ...album,
      artist: album.artist_ids.map((artist) => artist.name),
      artist_url: album.artist_ids.map((artist) => artist.avatar_url),
      // remove artist_ids
      artist_ids: undefined,
    }));

    return {
      total,
      page,
      limit,
      totalPages,
      items: this.cleanedAlbumData(albums),
      // items: transformedAlbums,
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
      limit = 20,
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
      .filter((album) => {
        // filter album doesn't have matching artists and songs
        const hasMatchingArtist = !artist || album.artist_ids.length > 0;
        const hasMatchingSong = !song || album.song_ids.length > 0;

        return hasMatchingArtist && hasMatchingSong;
      })
      .map((album) => ({
        // remove duplicate artist
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
      items: this.cleanedAlbumData(albums),
    };
  }

  async getAlbumById(albumId) {
    const album = await Album.findById(albumId)
      .populate({
        path: "artist_ids",
        select: "name avatar_url",
      })
      .populate({
        path: "song_ids",
        select: "title image_url",
      })
      .lean();

    if (!album) {
      throw new Error("Album not found");
    }

    return this.cleanedAlbumData([album])[0];
  }

  async getAlbumSongs(albumId, options = {}) {
    try {
      // Lấy giá trị page & limit từ options
      const { page = 1, limit = 10 } = options;

      // Chuyển đổi page & limit sang số nguyên
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      // Tìm album theo ID
      const album = await Album.findById(albumId);
      if (!album) {
        return { success: false, message: "Album not found", status: 404 };
      }

      // Tính toán pagination
      const totalSongs = album.song_ids.length;
      const totalPages = Math.ceil(totalSongs / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const songIdsToFetch = album.song_ids.slice(
        startIndex,
        startIndex + limitNum
      );

      // Lấy danh sách bài hát
      const songs = await Song.find({ _id: { $in: songIdsToFetch } });

      const formattedSongs = songs
        .map((song) => ({
          ...song.toObject(),
          singers: song.singer_ids, // Đổi tên `singer_ids` thành `artist`
        }))
        .map(({ singer_ids, author_ids, ...song }) => song); // Xóa `singer_ids` và `author_ids`

      return {
        total: totalSongs,
        limit: limitNum,
        page: pageNum,
        totalPages,
        items: formattedSongs,
      };
    } catch (err) {
      console.error("Error fetching songs:", err);
      return { success: false, message: "Server error", status: 500 };
    }
  }
  async getAlbumsByArtistNames(options = {}) {
    try {
      let { artistNames, page = 1, limit = 10 } = options;

      console.log("Server received artist names:", artistNames, page, limit);
      // Chuyển đổi thành số nguyên, tránh NaN
      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

      // Đảm bảo artistNames là mảng
      if (!Array.isArray(artistNames)) {
        artistNames = [artistNames];
      }

      // Đếm số album có nghệ sĩ thuộc danh sách
      let totalAlbums = await Album.countDocuments({
        artist_names: { $in: artistNames },
      });

      let albums = [];
      if (totalAlbums > 0) {
        albums = await Album.find({ artist_names: { $in: artistNames } })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum);
      } else {
        // Nếu không có album nào, chọn ngẫu nhiên 3 album
        console.log("No albums found, fetching random albums...");
        albums = await Album.aggregate([{ $sample: { size: 3 } }]);
        totalAlbums = albums.length;
      }
      const formattedAlbums = albums.map(({ artist_ids, ...album }) => ({
        ...album,
        artist: artist_ids,
      }));

      console.log("Formatted albums artist:", formattedAlbums);

      return {
        total: totalAlbums,
        limit: limitNum,
        page: pageNum,
        totalPages: totalAlbums > 0 ? Math.ceil(totalAlbums / limitNum) : 1,
        items: formattedAlbums,
      };
    } catch (err) {
      console.error("Error fetching albums by artist names:", err);
      return { success: false, message: "Server error", status: 500 };
    }
  }
}

export default new AlbumService();
