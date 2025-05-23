import mongoose from "mongoose";
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
  getTopAlbum = async () => {
    try {
      return await Album.find({}, "_id title cover_url play_count")
        .sort({ play_count: -1 }) // Sắp xếp giảm dần theo play_count
        .limit(10); // Giới hạn 10 album
    } catch (error) {
      throw new Error("Get top album failed");
    }
  };
  getMostAlbum = async () => {
    return await Album.findOne({}, "_id title cover_url play_count").sort({
      play_count: -1,
    }); // Sắp xếp giảm dần theo play_count
  };

  getAlsoLike = async () => {
    // Query albums and populate with artist information
    const albums = await Album.find({})
      .select("_id title cover_url artist_ids")
      .populate({
        path: "artist_ids",
        model: Artist,
        select: "name",
      });
    // .sort({ like_count: -1 })
    return albums.map((album) => ({
      _id: album._id,
      title: album.title,
      artist_name: album.artist_ids.map((artist) => artist.name),
      cover_url: album.cover_url,
    }));
  };

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
      artist_url: album.artist_ids.map((artist) => artist.avatar_url),
    }));

    return {
      total,
      page,
      limit,
      totalPages,
      // items: this.cleanedAlbumData(albums),
      items: this.cleanedAlbumData(transformedAlbums),
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
        select: "name avatar_url",
      })
      .lean();
    const transformedAlbums = albums.map((album) => ({
      ...album,
      artist_url: album.artist_ids.map((artist) => artist.avatar_url),
    }));

    return {
      total,
      page,
      limit,
      totalPages,
      items: this.cleanedAlbumData(transformedAlbums),
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

  // async getAlbumById(albumId) {
  //   const album = await Album.findById(albumId)
  //     .populate({
  //       path: "artist_ids",
  //       select: "name avatar_url",
  //     })
  //     .populate({
  //       path: "song_ids",
  //       select: "title image_url",
  //     })
  //     .lean();

  //   if (!album) {
  //     throw new Error("Album not found");
  //   }

  //   return this.cleanedAlbumData([album])[0];
  // }
  async getAlbumById(albumId) {
    const album = await Album.findById(albumId)
      .populate({
        path: "artist_ids",
        model: "Artist",
        select: "name avatar_url",
      })
      .populate({
        path: "song_ids",
        model: "Song",
        select: "title image_url",
      })
      .lean();

    if (!album) {
      throw new Error("Album not found");
    }

    const transformedAlbum = {
      ...album,
      artist_url:
        album.artist_ids?.map?.((a) => a.avatar_url).filter(Boolean) || [],
    };

    const cleaned = this.cleanedAlbumData([transformedAlbum]);

    return cleaned[0];
  }

  async getAlbumSongs(albumId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const album = await Album.findById(albumId);
      if (!album) {
        return { success: false, message: "Album not found", status: 404 };
      }

      const totalSongs = album.song_ids.length;
      const totalPages = Math.ceil(totalSongs / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const songIdsToFetch = album.song_ids.slice(
        startIndex,
        startIndex + limitNum
      );

      let songs = await Song.find({ _id: { $in: songIdsToFetch } })
        .populate({
          path: "singer_ids",
          select: "name bio avatar_url followers",
        })
        .populate({
          path: "author_ids",
          select: "name bio avatar_url followers",
        })
        .populate({
          path: "genre_ids",
          select: "name description image_url createdAt",
        });

      const transformedSongs = songs.map((song) =>
        this.transformSongData(song)
      );

      return {
        total: totalSongs,
        limit: limitNum,
        page: pageNum,
        totalPages,
        items: transformedSongs,
      };
    } catch (err) {
      console.error("Error fetching songs:", err);
      return { success: false, message: "Server error", status: 500 };
    }
  }

  transformSongData(song) {
    return {
      _id: song._id.toString(),
      title: song.title,
      lyric: song.lyrics,
      is_premium: song.is_premium,
      like_count: song.like_count,
      mp3_url: song.mp3_url,
      image_url: song.image_url,
      singers: song.singer_ids.map((singer) => ({
        _id: singer._id.toString(),
        name: singer.name,
        bio: singer.bio || "",
        avatar_url: singer.avatar_url || singer.image_url,
        followers: singer.followers || 0,
      })),
      authors: song.author_ids.map((author) => ({
        _id: author._id.toString(),
        name: author.name,
        bio: author.bio || "",
        avatar_url: author.avatar_url || author.image_url,
        followers: author.followers || 0,
      })),
      genres: song.genre_ids.map((genre) => ({
        _id: genre._id.toString(),
        name: genre.name,
        description: genre.description || "",
        image_url: genre.image_url || "",
        create_at: genre.createdAt || new Date(),
      })),
    };
  }

  async getAlbumsByArtistNames(options = {}) {
    const {
      artistNames = [],
      page = 1,
      limit = 10,
    } = helperFunc.validatePaginationOptions(options);
    const skip = (page - 1) * limit;

    const artistNameArray = Array.isArray(artistNames)
      ? artistNames
      : [artistNames];
    const baseQuery = { artist_names: { $in: artistNameArray } };

    let total = await Album.countDocuments(baseQuery);
    let albums = [];

    if (total > 0) {
      albums = await Album.find(baseQuery)
        .sort({ like_count: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: "artist_ids",
          model: "Artist",
          select: "name avatar_url",
        })
        .lean();
    } else {
      albums = await Album.aggregate([{ $sample: { size: 3 } }]);

      const artistIdSet = new Set(
        albums.flatMap((album) =>
          Array.isArray(album.artist_ids)
            ? album.artist_ids.map((id) => id.toString())
            : []
        )
      );

      const artists = await Artist.find({
        _id: { $in: Array.from(artistIdSet) },
      })
        .select("name avatar_url")
        .lean();

      const artistMap = Object.fromEntries(
        artists.map((a) => [a._id.toString(), a])
      );

      albums = albums.map((album) => ({
        ...album,
        artist_ids: (album.artist_ids || []).map(
          (id) => artistMap[id.toString()] || { name: null, avatar_url: null }
        ),
      }));
    }

    const transformedAlbums = albums.map((album) => ({
      ...album,
      artist_url:
        album.artist_ids?.map?.((a) => a.avatar_url).filter(Boolean) || [],
    }));

    const cleaned = this.cleanedAlbumData(transformedAlbums);

    return {
      total,
      limit,
      page,
      totalPages: total > 0 ? Math.ceil(total / limit) : 1,
      items: cleaned,
    };
  }
}

export default new AlbumService();
