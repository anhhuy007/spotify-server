import albumService from "../services/album.service.js";
import helperFunc from "../utils/helperFunc.js";

const getTopAlbum = async (req, res) => {
  try {
    const artists = await albumService.getTopAlbum();

    res
      .status(200)
      .json(helperFunc.successResponse(true, "Top album", artists));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAlsoLike = async (req, res) => {
  try {
    const artists = await albumService.getAlsoLike();

    res
      .status(200)
      .json(helperFunc.successResponse(true, "Also like top", artists));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export default {
  getTopAlbum,
  getAlsoLike,
};
