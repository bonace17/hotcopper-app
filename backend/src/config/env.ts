import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 8080),
  openAiApiKey: process.env.OPENAI_API_KEY || "",
  openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini"
};
