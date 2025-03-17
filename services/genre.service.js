import Genre from "../models/genre.schema.js";
import helperFunc from "../utils/helperFunc.js";
class GenreService{
    async getGenres(options={}) {
        try{

            let { page=1, limit=20, filter={} } = helperFunc.validatePaginationOptions(options);
            page = Number.isInteger(Number(page)) ? Number(page) : 1;
            limit = Number.isInteger(Number(limit)) ? Number(limit) : 20;

            const skip = (page - 1) * limit;
            const total = await Genre.countDocuments(filter);
            const totalPages = Math.ceil(total / limit);
            const baseQuery = { ...filter };
            const genres = await Genre.find(baseQuery)
                .skip(skip)
                .limit(limit)
                .lean();
            return {
                total,
                page,
                limit,
                totalPages,
                items: genres,
            };

        }
        catch(error){
            console.log("Get genres error: ", error);
            throw new Error("Failed to get genres");
        }
        
    }
    
}
export default new GenreService();
