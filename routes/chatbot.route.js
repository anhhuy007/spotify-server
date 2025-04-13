import express from "express";
import chatbotController from "../controllers/chatbot.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/ask",
  authMiddleware.authenticateUser,
  chatbotController.getChatbotResponse
);
export default router;
