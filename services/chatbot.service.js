import mongoose from "mongoose";
import helperFunc from "../utils/helperFunc.js";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();
const groqInstance = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

class ChatbotService {
  async getChatbotResponse(query) {
    const { ask } = query;
    const chatCompletion = await groqInstance.chat.completions.create({
      messages: [
        {
          role: "user",
          content: ask, // Sử dụng query làm nội dung
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 1,
      max_completion_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null,
    });

    // Trả về nội dung phản hồi từ chatbot
    return chatCompletion.choices[0].message.content;
  }
}

export default new ChatbotService();
