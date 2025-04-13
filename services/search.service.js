import Album from "../models/album.schema.js";
import Song from "../models/song.schema.js";
import Artist from "../models/artist.schema.js";
import Genre from "../models/genre.schema.js";
import mongoose from "mongoose";

class SearchService {
  async getSearchResult(options = {}) {
    let { page = 1, limit = 10, query, genre, type } = options;

    if (typeof limit !== "number") {
        limit = parseInt(limit, 10) || 10;
    }

    const matchQuery = query
        ? {
              $or: [
                  { name: { $regex: query, $options: "i" } },
                  { title: { $regex: query, $options: "i" } },
              ],
          }
        : {};
    if (genre) matchQuery.genre = genre;

    let results = [];
    let totalCount = 0;

    const searchPromises = [];

    if (!type || type === "song") {
        searchPromises.push(
            Song.find(matchQuery)
                .select("title singer_ids image_url")
                .populate({
                    path: "singer_ids",
                    select: "name -_id",
                })
                .lean()
                .then((docs) =>
                    docs.map((doc) => {
                        let modifiedDoc = { ...doc };

                        // Chuyển singer_ids thành artists_name nếu tồn tại
                        modifiedDoc.artists_name = Array.isArray(modifiedDoc.singer_ids)
                            ? modifiedDoc.singer_ids.map((artist) => artist.name)
                            : [];

                        // Đổi title thành name
                        modifiedDoc.name = modifiedDoc.title;

                        // Xóa các trường không cần
                        delete modifiedDoc.title;
                        delete modifiedDoc.singer_ids;

                        // Thêm type
                        modifiedDoc.type = "song";

                        return modifiedDoc;
                    })
                )
        );
    }

    if (!type || type === "artist") {
        searchPromises.push(
            Artist.find(matchQuery)
                .select("name avatar_url")
                .lean()
                .then((docs) =>
                    docs.map((doc) => {
                        let modifiedDoc = { ...doc };

                        modifiedDoc.image_url = modifiedDoc.avatar_url;
                        delete modifiedDoc.avatar_url;

                        modifiedDoc.type = "artist";

                        return modifiedDoc;
                    })
                )
        );
    }

    if (!type || type === "album") {
        searchPromises.push(
            Album.find(matchQuery)
                .select("title cover_url artist_ids")
                .populate({
                    path: "artist_ids",
                    select: "name -_id",
                })
                .lean()
                .then((docs) =>
                    docs.map((doc) => {
                        let modifiedDoc = { ...doc };

                        modifiedDoc.artists_name = Array.isArray(modifiedDoc.artist_ids)
                            ? modifiedDoc.artist_ids.map((artist) => artist.name)
                            : [];

                        modifiedDoc.name = modifiedDoc.title;
                        delete modifiedDoc.title;

                        modifiedDoc.image_url = modifiedDoc.cover_url;
                        delete modifiedDoc.cover_url;

                        modifiedDoc.type = "album";

                        return modifiedDoc;
                    })
                )
        );
    }

    if (!type || type === "genre") {
        searchPromises.push(
            Genre.find(matchQuery)
                .select("name image_url")
                .lean()
                .then((docs) =>
                    docs.map((doc) => ({
                        ...doc,
                        type: "genre",
                    }))
                )
        );
    }

    const searchResults = await Promise.all(searchPromises);
    results = searchResults.flat();
    totalCount = results.length;

    const startIndex = (page - 1) * limit;
    const paginatedResults = results.slice(startIndex, startIndex + limit);

    return {
        page,
        limit,
        total: totalCount,
        items: paginatedResults,
    };
}

}

export default new SearchService();
