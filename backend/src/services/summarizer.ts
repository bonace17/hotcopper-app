import axios from "axios";
import { env } from "../config/env";
import { RawPost, StockSummary, Ticker } from "../types/stock";

function fallbackSummary(ticker: Ticker, posts: RawPost[]): StockSummary {
  const keyPoints = posts.slice(0, 5).map((p) => p.title);
  return {
    ticker,
    key_points: keyPoints.length ? keyPoints : ["No recent posts parsed."],
    sentiment: "neutral",
    risks: ["Automatic AI summary unavailable; using fallback extraction."],
    catalysts: ["New post activity and thread updates on HotCopper."],
    updated_at: new Date().toISOString()
  };
}

export async function buildSummary(ticker: Ticker, posts: RawPost[]): Promise<StockSummary> {
  if (!env.openAiApiKey) {
    return fallbackSummary(ticker, posts);
  }

  const prompt = `You are a financial discussion summarizer. Summarize recent HotCopper posts for ${ticker}. Return strict JSON with keys: key_points(string[] 5 items), sentiment("bullish"|"neutral"|"bearish"), risks(string[]), catalysts(string[]). Posts: ${JSON.stringify(posts.slice(0, 10))}`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/responses",
      {
        model: env.openAiModel,
        input: prompt,
        text: { format: { type: "json_object" } }
      },
      {
        headers: {
          Authorization: `Bearer ${env.openAiApiKey}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    const text = response.data?.output?.[0]?.content?.[0]?.text as string | undefined;
    if (!text) {
      return fallbackSummary(ticker, posts);
    }

    const parsed = JSON.parse(text) as Omit<StockSummary, "ticker" | "updated_at">;
    return {
      ticker,
      key_points: parsed.key_points?.slice(0, 5) || [],
      sentiment: parsed.sentiment || "neutral",
      risks: parsed.risks || [],
      catalysts: parsed.catalysts || [],
      updated_at: new Date().toISOString()
    };
  } catch {
    return fallbackSummary(ticker, posts);
  }
}
