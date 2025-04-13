import mongoose from "mongoose";
import Playlist from "../models/playlist.schema.js";
import Song from "../models/song.schema.js";
import User from "../models/user.schema.js"; // Assuming you have a User model
import helperFunc from "../utils/helperFunc.js";
class PlaylistService {
  cleanedPlaylistData(playlists) {
    return playlists.map(({ song_ids, owner_id, ...rest }) => ({
      ...rest,
      owner: owner_id?.name || "Unknown",
      owner_avatar: owner_id?.avatar_url || "",
      song_count: song_ids?.length || 0,
    }));
  }

  getTopPlaylists = async () => {
    try {
      return await Playlist.find(
        { is_public: true },
        "_id name cover_url like_count"
      )
        .sort({ like_count: -1 })
        .limit(10);
    } catch (error) {
      throw new Error("Get top playlists failed");
    }
  };

  async getPopularPlaylists(options = {}) {
    const {
      page = 1,
      limit = 20,
      filter = {},
    } = helperFunc.validatePaginationOptions(options);
    const skip = (page - 1) * limit;

    // Only get public playlists for popular list
    const baseQuery = { ...filter, is_public: true };
    const total = await Playlist.countDocuments(baseQuery);
    const totalPages = Math.ceil(total / limit);

    const playlists = await Playlist.find(baseQuery)
      .sort({ like_count: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "owner_id",
        model: "User",
        select: "name avatar_url",
      })
      .populate({
        path: "song_ids",
        model: "Song",
        select: "title image_url",
      })
      .lean();

    return {
      total,
      page,
      limit,
      totalPages,
      items: this.cleanedPlaylistData(playlists),
    };
  }

  async getNewPlaylists(options = {}) {
    const { page, limit, filter } =
      helperFunc.validatePaginationOptions(options);
    const skip = (page - 1) * limit;

    // Only get public playlists
    const baseQuery = { ...filter, is_public: true };
    const total = await Playlist.countDocuments(baseQuery);
    const totalPages = Math.ceil(total / limit);

    const playlists = await Playlist.find(baseQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "owner_id",
        model: "User",
        select: "name avatar_url",
      })
      .populate({
        path: "song_ids",
        model: "Song",
        select: "title image_url",
      })
      .lean();

    return {
      total,
      page,
      limit,
      totalPages,
      items: this.cleanedPlaylistData(playlists),
    };
  }

  async getPlaylistsWithFilter(options = {}) {
    const {
      page = 1,
      limit = 20,
      name = "",
      owner = "",
      song = "",
      sortBy = "",
      sortOrder = "asc",
      isPublic = true,
    } = options;

    const parsedPage = Math.max(parseInt(page), 1);
    const parsedLimit = Math.max(parseInt(limit), 1);
    const skip = (parsedPage - 1) * parsedLimit;

    let query = Playlist.find();

    // Base query - only public playlists unless specifically requesting private ones
    if (isPublic !== undefined) {
      query = query
        .where("is_public")
        .equals(isPublic === "true" || isPublic === true);
    }

    // Filter by playlist name
    if (name) {
      query = query.where("name", new RegExp(name, "i"));
    }

    // Filter by owner name
    if (owner) {
      const ownerQuery = { name: new RegExp(owner, "i") };
      const matchingOwners = await User.find(ownerQuery, "_id");
      const ownerIds = matchingOwners.map((owner) => owner._id);
      query = query.where("owner_id").in(ownerIds);
    }

    // Filter by song title
    if (song) {
      const songQuery = { title: new RegExp(song, "i") };
      const matchingSongs = await Song.find(songQuery, "_id");
      const songIds = matchingSongs.map((song) => song._id);
      query = query.where("song_ids").in(songIds);
    }

    // Populate relations
    query = query
      .populate({
        path: "owner_id",
        select: "name avatar_url",
      })
      .populate({
        path: "song_ids",
        select: "title image_url",
      });

    // Sort by field and order
    const validSortFields = ["name", "createdAt", "like_count"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const sortDirection = sortOrder === "asc" ? 1 : -1;

    if (sortField === "name") {
      query = query
        .collation({ locale: "en" })
        .sort({ [sortField]: sortDirection });
    } else {
      query = query.sort({ [sortField]: sortDirection });
    }

    const total = await Playlist.countDocuments(query.getQuery());
    query = query.skip(skip).limit(parsedLimit);

    let playlists = await query.lean();

    const totalPages = Math.ceil(total / parsedLimit);

    return {
      total,
      page: parsedPage,
      limit: parsedLimit,
      totalPages,
      items: this.cleanedPlaylistData(playlists),
    };
  }

  async getPlaylistById(playlistId) {
    const playlist = await Playlist.findById(playlistId)
      .populate({
        path: "owner_id",
        select: "name avatar_url",
      })
      .populate({
        path: "song_ids",
        select: "title image_url mp3_url",
      })
      .lean();

    if (!playlist) {
      throw new Error("Playlist not found");
    }

    // Check if playlist is public or belongs to the user
    if (!playlist.is_public && !req.user._id.equals(playlist.owner_id._id)) {
      throw new Error("You don't have permission to view this playlist");
    }

    return this.cleanedPlaylistData([playlist])[0];
  }

  async getPlaylistSongs(playlistId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        return { success: false, message: "Playlist not found", status: 404 };
      }

      const totalSongs = playlist.song_ids.length;
      const totalPages = Math.ceil(totalSongs / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const songIdsToFetch = playlist.song_ids.slice(
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

  async updatePlaylist(playlistId, userId, updateData) {
    // Find the playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new Error("Playlist not found");
    }

    // Check ownership
    if (!playlist.owner_id.equals(userId)) {
      throw new Error("You don't have permission to update this playlist");
    }

    // Only update allowed fields
    const allowedUpdates = ["name", "description", "cover_url", "is_public"];
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (updateData[field] !== undefined) {
        updates[field] = updateData[field];
      }
    });

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { $set: updates },
      { new: true }
    );

    return updatedPlaylist;
  }

  async deletePlaylist(playlistId, userId) {
    // Find the playlist
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new Error("Playlist not found");
    }

    // Check ownership
    if (!playlist.owner_id.equals(userId)) {
      throw new Error("You don't have permission to delete this playlist");
    }

    // Delete the playlist
    await Playlist.findByIdAndDelete(playlistId);

    return { success: true, message: "Playlist deleted successfully" };
  }

  async addSongToPlaylist(playlistId, songId, userId) {
    // Check if playlist exists and user owns it
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new Error("Playlist not found");
    }

    if (!playlist.owner_id.equals(userId)) {
      throw new Error("You don't have permission to modify this playlist");
    }

    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      throw new Error("Song not found");
    }

    // Check if song is already in playlist
    if (playlist.song_ids.includes(songId)) {
      return playlist; // Song already in playlist, no need to update
    }

    // Add song to playlist
    playlist.song_ids.push(songId);
    await playlist.save();

    return playlist;
  }

  async removeSongFromPlaylist(playlistId, songId, userId) {
    // Check if playlist exists and user owns it
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      throw new Error("Playlist not found");
    }

    if (!playlist.owner_id.equals(userId)) {
      throw new Error("You don't have permission to modify this playlist");
    }

    // Remove song from playlist
    playlist.song_ids = playlist.song_ids.filter(
      (id) => id.toString() !== songId
    );

    await playlist.save();

    return playlist;
  }

  async getUserPlaylists(userId, options = {}) {
    const { page = 1, limit = 20 } = options;
    const parsedPage = Math.max(parseInt(page), 1);
    const parsedLimit = Math.max(parseInt(limit), 1);
    const skip = (parsedPage - 1) * parsedLimit;

    // Get playlists where user is the owner
    const total = await Playlist.countDocuments({ owner_id: userId });
    const totalPages = Math.ceil(total / parsedLimit);

    const playlists = await Playlist.find({ owner_id: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .select("_id name cover_url owner_id song_ids")
      .populate({
        path: "owner_id",
        model: User,
        select: "username",
      });

    const re = playlists.map((playlist) => ({
      _id: playlist._id,
      name: playlist.name,
      cover_url: playlist.cover_url,
      creator_name: playlist.owner_id.username,
      song_count: playlist.song_ids.length,
    }));

    return re;
  }

  async createPlaylist(playlistData, userId, options = {}) {
    // Create and save the new playlist
    const newPlaylist = new Playlist({
      name: playlistData.name,
      description: playlistData.description || "",
      cover_url: playlistData.cover_url || "",
      owner_id: playlistData.owner_id,
      song_ids: playlistData.song_ids || [],
      is_public:
        playlistData.is_public !== undefined ? playlistData.is_public : true,
    });

    await newPlaylist.save();

    return newPlaylist;
  }

  async getUserPlaylist(user, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        filter = {},
      } = helperFunc.validatePaginationOptions(options);
      const skip = (page - 1) * limit;
      const total = await Playlist.countDocuments(filter);
      const totalPages = Math.ceil(total / limit);

      const baseQuery = { ...filter, owner_id: user._id }; // Lọc theo user

      const playlists = await Playlist.find(baseQuery)
        .sort({ likes: -1 })
        .skip(skip)
        .limit(limit);

      return {
        total,
        limit,
        page,
        totalPages,
        items: playlists,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Database query failed");
    }
  }
  async createNewPlaylist(user, options = {}) {
    try {
      const { id, name, image } = options;
      const newPlaylist = new Playlist({
        name,
        cover_url: image,
        owner_id: user._id, // Gán playlist này cho user đã xác thực
        song_ids: [id], // Thêm bài hát vào danh sách
        like_count: 0,
      });

      await newPlaylist.save();
      return {
        message: "Playlist created",
        playlist: newPlaylist,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Database query failed");
    }
  }

  async addSongToPlaylist({ playlistId, songId }) {
    return Playlist.findByIdAndUpdate(
      playlistId,
      { $addToSet: { song_ids: songId } },
      { new: true }
    );
  }

  transformSongData(song) {
    return {
      _id: song._id?.toString() || "",
      title: song.title || "Unknown",
      lyrics: song.lyrics || "",
      is_premium: song.is_premium || false,
      like_count: song.like_count || 0,
      mp3_url: song.mp3_url || "",
      image_url: song.image_url || "",
      singers: (song.singer_ids || []).map((singer) => ({
        _id: singer._id?.toString() || "",
        name: singer.name || "Unknown",
        bio: singer.bio || "",
        avatar_url: singer.avatar_url || "",
        followers: singer.followers || 0,
      })),
      authors: (song.author_ids || []).map((author) => ({
        _id: author._id?.toString() || "",
        name: author.name || "Unknown",
        bio: author.bio || "",
        avatar_url: author.avatar_url || "",
        followers: author.followers || 0,
      })),
      genres: (song.genre_ids || []).map((genre) => ({
        _id: genre._id?.toString() || "",
        name: genre.name || "Unknown",
        description: genre.description || "",
        image_url: genre.image_url || "",
        create_at: genre.createdAt || new Date(),
      })),
    };
  }
  async getPlaylistById(id) {
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return { message: "Playlist not found", status: 404 };
    }
    return playlist;
  }
  async getPlaylistSongs(playlistId, query = {}) {
    const { page = 1, limit = 10 } = query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    // Fetch the playlist and populate the song_ids field
    const playlist = await Playlist.findById(playlistId).populate("song_ids");
    if (!playlist) {
      console.error("Playlist not found:", playlistId);
      return { success: false, message: "Playlist not found", status: 404 };
    }

    const totalSongs = playlist.song_ids.length;
    const totalPages = Math.ceil(totalSongs / limitNum);
    const startIndex = (pageNum - 1) * limitNum;

    // Slice the song_ids for pagination (already populated)
    const songDocsToTransform = playlist.song_ids.slice(
      startIndex,
      startIndex + limitNum
    );

    // Populate nested fields manually since .populate("song_ids") doesn't deeply populate
    const populatedSongs = await Promise.all(
      songDocsToTransform.map((songDoc) =>
        songDoc
          .populate([
            {
              path: "singer_ids",
              select: "name bio avatar_url followers",
            },
            {
              path: "author_ids",
              select: "name bio avatar_url followers",
            },
            {
              path: "genre_ids",
              select: "name description image_url",
            },
          ])
          .then((populated) => populated)
      )
    );

    if (!populatedSongs || populatedSongs.length === 0) {
      console.error("No songs found in playlist after slicing.");
      return {
        total: totalSongs,
        limit: limitNum,
        page: pageNum,
        totalPages,
        items: [],
      };
    }

    // Transform the song data
    const transformedSongs = populatedSongs.map((song) => {
      return this.transformSongData(song);
    });

    return {
      total: totalSongs,
      limit: limitNum,
      page: pageNum,
      totalPages,
      items: transformedSongs,
    };
  }
  async removeSongFromPlaylist(playlistId, songId) {
    return Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { song_ids: songId } },
      { new: true }
    );
  }

  async updatePlaylistInfo(playlistId, name, description) {
    return Playlist.findByIdAndUpdate(
      playlistId,
      { $set: { name, description } },
      { new: true }
    );
  }
  async removePlaylist(playlistId) {
    return Playlist.findByIdAndDelete(playlistId);
  }
  async getRandomSongs(playlistId, { limit = 10 } = {}) {
    const parsedLimit = parseInt(limit);

    // Lấy danh sách song_ids từ playlist
    const playlist = await Playlist.findById(playlistId)
      .select("song_ids")
      .lean();
    const excludedSongIds = playlist ? playlist.song_ids : [];

    // Sử dụng MongoDB Aggregation để lấy bài hát ngẫu nhiên, loại trừ các bài hát trong playlist
    const songs = await Song.aggregate([
      { $match: { _id: { $nin: excludedSongIds } } }, // Loại trừ các bài hát trong playlist
      { $sample: { size: parsedLimit } }, // Lấy ngẫu nhiên limit bài hát
    ]);

    // Populate dữ liệu sau khi sử dụng aggregation
    const populatedSongs = await Song.populate(songs, [
      { path: "singer_ids", select: "name bio avatar_url followers" },
      { path: "author_ids", select: "name bio avatar_url followers" },
      { path: "genre_ids", select: "name description image_url createdAt" },
    ]);

    // Transform each song to match the Java class structure
    const transformedSongs = populatedSongs.map((song) =>
      this.transformSongData(song)
    );

    return {
      total: transformedSongs.length,
      page: 1,
      limit: parsedLimit,
      totalPages: 1,
      items: transformedSongs,
    };
  }
}

export default new PlaylistService();
