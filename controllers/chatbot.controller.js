import asyncHandler from "express-async-handler";
import ChatbotService from "../services/chatbot.service.js";
import helperFunc from "../utils/helperFunc.js";

const getChatbotResponse = async (req, res) => {
  try {
    const response = await ChatbotService.getChatbotResponse(req.query);
    res
      .status(200)
      .json(helperFunc.successResponse(true, "Chat bot response", response));
  } catch (error) {
    console.log("Get chatbot response error: ", error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getChatbotResponse,
};
