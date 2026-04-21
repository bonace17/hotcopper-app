import axios from "axios";
import { parsePostsFromHtml } from "../parser/postParser";
import { RawPost, Ticker } from "../types/stock";

const TICKER_URLS: Record<Ticker, string> = {
  TGM: "https://hotcopper.com.au/asx/tgm/",
  FAU: "https://hotcopper.com.au/asx/fau/"
};

export async function fetchTickerPosts(ticker: Ticker): Promise<RawPost[]> {
  const url = TICKER_URLS[ticker];
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "text/html,application/xhtml+xml"
  };

  const primary = await axios.get<string>(url, {
    timeout: 15000,
    headers
  });
  let posts = parsePostsFromHtml(primary.data, ticker);
  if (posts.length > 0) return posts;

  const fallback = await axios.get<string>(`${url}?page=1`, {
    timeout: 15000,
    headers
  });
  posts = parsePostsFromHtml(fallback.data, ticker);
  return posts;
}
