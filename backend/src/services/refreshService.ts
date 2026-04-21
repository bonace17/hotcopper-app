import { fetchTickerPosts } from "../crawler/hotcopperCrawler";
import { memoryStore } from "./memoryStore";
import { buildSummary } from "./summarizer";
import { Ticker } from "../types/stock";

const TICKERS: Ticker[] = ["TGM", "FAU"];

export async function refreshTicker(ticker: Ticker) {
  const posts = await fetchTickerPosts(ticker);
  memoryStore.setPosts(ticker, posts);
  const summary = await buildSummary(ticker, posts);
  memoryStore.setSummary(ticker, summary);
  return summary;
}

export async function refreshAll() {
  await Promise.all(TICKERS.map((ticker) => refreshTicker(ticker)));
}
