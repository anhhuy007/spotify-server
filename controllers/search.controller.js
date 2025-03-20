import asyncHandler from "express-async-handler";
import SearchService from "../services/search.service.js";
import helperFunc from "../utils/helperFunc.js";

const getSearchResult = asyncHandler(async (req, res) => {
  try {
    console.log(req.query);

    const response = await SearchService.getSearchResult(req.query);
    console.log(response);
    res
      .status(200)
      .json(
        helperFunc.successResponse(true, "Searched successfully", response)
      );
  } catch (error) {
    res
      .status(500)
      .json(helperFunc.errorResponse(false, "Internal server error"));  //return error response
  }
});
export default { getSearchResult }; //export controller fucntion
