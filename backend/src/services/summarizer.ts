import axios from "axios";
import { env } from "../config/env";
import { RawPost, StockSummary, Ticker } from "../types/stock";

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function sentenceFromExcerpt(excerpt: string): string {
  const cleaned = normalizeText(excerpt);
  if (!cleaned) return "";
  const firstSentence = cleaned.split(/[.!?]/)[0]?.trim() || cleaned;
  return firstSentence.length > 180 ? `${firstSentence.slice(0, 177)}...` : firstSentence;
}

function synthesizedKeyPoints(posts: RawPost[]): string[] {
  const points: string[] = [];
  for (const post of posts) {
    const candidate = sentenceFromExcerpt(post.excerpt);
    if (candidate.length < 20) continue;
    if (!points.some((p) => p.toLowerCase() === candidate.toLowerCase())) {
      points.push(candidate);
    }
    if (points.length >= 5) break;
  }
  return points;
}

function synthesizedSummary(ticker: Ticker, posts: RawPost[]): string {
  if (posts.length === 0) {
    return `${ticker} currently has no parseable detailed discussion content from source pages.`;
  }
  const sample = posts
    .slice(0, 3)
    .map((p) => sentenceFromExcerpt(p.excerpt))
    .filter((s) => s.length > 0)
    .join(" ");
  if (!sample) {
    return `${ticker} has active thread links but limited readable body content at the moment.`;
  }
  return `Recent ${ticker} discussion focuses on: ${sample}`;
}

function fallbackSummary(ticker: Ticker, posts: RawPost[]): StockSummary {
  const keyPoints = synthesizedKeyPoints(posts);
  return {
    ticker,
    ai_summary: synthesizedSummary(ticker, posts),
    key_points: keyPoints.length ? keyPoints : ["No detailed key points extracted from current post bodies."],
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

  const prompt = `You are a financial discussion summarizer. Read the provided detailed HotCopper thread excerpts for ${ticker}. Return strict JSON with keys: ai_summary(string concise paragraph), key_points(string[] 5 items), sentiment("bullish"|"neutral"|"bearish"), risks(string[]), catalysts(string[]). Posts: ${JSON.stringify(posts.slice(0, 10))}`;

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
      ai_summary: parsed.ai_summary || synthesizedSummary(ticker, posts),
      key_points: parsed.key_points?.slice(0, 5) || synthesizedKeyPoints(posts),
      sentiment: parsed.sentiment || "neutral",
      risks: parsed.risks || [],
      catalysts: parsed.catalysts || [],
      updated_at: new Date().toISOString()
    };
  } catch {
    return fallbackSummary(ticker, posts);
  }
}
