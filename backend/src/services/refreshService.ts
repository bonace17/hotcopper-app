import { fetchTickerPosts } from "../crawler/hotcopperCrawler";
import { memoryStore } from "./memoryStore";
import { buildSummary } from "./summarizer";
import { StockSummary, Ticker } from "../types/stock";

const TICKERS: Ticker[] = ["TGM", "FAU"];

function unavailableSummary(ticker: Ticker): StockSummary {
  return {
    ticker,
    ai_summary: "Source temporarily unavailable. Summary will refresh automatically when access is restored.",
    key_points: ["Live source temporarily unavailable. Showing fallback summary."],
    sentiment: "neutral",
    risks: ["Upstream website temporarily blocking server requests (HTTP 403)."],
    catalysts: ["Tap Refresh later; service will retry automatically."],
    updated_at: new Date().toISOString()
  };
}

export async function refreshTicker(ticker: Ticker) {
  try {
    const posts = await fetchTickerPosts(ticker);
    memoryStore.setPosts(ticker, posts);
    const summary = await buildSummary(ticker, posts);
    memoryStore.setSummary(ticker, summary);
    return summary;
  } catch {
    const cached = memoryStore.getSummary(ticker);
    if (cached) {
      return cached;
    }
    const fallback = unavailableSummary(ticker);
    memoryStore.setSummary(ticker, fallback);
    return fallback;
  }
}

export async function refreshAll() {
  await Promise.all(TICKERS.map((ticker) => refreshTicker(ticker)));
}
