import axios from "axios";
import { parsePostsFromHtml } from "../parser/postParser";
import { RawPost, Ticker } from "../types/stock";

const TICKER_URLS: Record<Ticker, string> = {
  TGM: "https://hotcopper.com.au/asx/tgm/",
  FAU: "https://hotcopper.com.au/asx/fau/"
};

const MAX_DETAIL_POSTS = 5;

function normalizeThreadUrl(rawUrl: string): string {
  const cleaned = rawUrl.replace(/[),.;]+$/g, "").trim();
  if (cleaned.startsWith("http")) return cleaned;
  return `https://hotcopper.com.au${cleaned.startsWith("/") ? "" : "/"}${cleaned}`;
}

function extractThreadUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/hotcopper\.com\.au\/threads\/[^\s)"'<>]+/g) || [];
  const deduped = new Set(matches.map(normalizeThreadUrl));
  return [...deduped];
}

function extractTitleAndExcerpt(markdown: string, fallbackUrl: string) {
  const lines = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => Boolean(line));

  const title =
    lines.find((line) => line.startsWith("# "))?.replace(/^#\s+/, "").trim() ||
    lines.find((line) => line.length > 10 && !line.startsWith("|")) ||
    fallbackUrl.split("/").filter(Boolean).pop()?.replace(/[-_]/g, " ") ||
    "HotCopper thread";

  const excerpt = lines
    .filter((line) => !line.startsWith("#"))
    .slice(0, 12)
    .join(" ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);

  return { title, excerpt };
}

async function fetchThreadDetailPosts(ticker: Ticker, tickerUrl: string): Promise<RawPost[]> {
  const listMirrorUrl = `https://r.jina.ai/http://${tickerUrl.replace(/^https?:\/\//, "")}`;
  const listResponse = await axios.get<string>(listMirrorUrl, {
    timeout: 30000,
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
  });

  const threadUrls = extractThreadUrls(listResponse.data).slice(0, MAX_DETAIL_POSTS);
  if (threadUrls.length === 0) return [];

  const detailedPosts = await Promise.all(
    threadUrls.map(async (url) => {
      const detailMirrorUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, "")}`;
      const detailResponse = await axios.get<string>(detailMirrorUrl, {
        timeout: 30000,
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      });
      const { title, excerpt } = extractTitleAndExcerpt(detailResponse.data, url);

      return {
        ticker,
        title,
        author: "unknown",
        postedAt: "",
        url,
        excerpt
      } as RawPost;
    })
  );

  return detailedPosts.filter((post) => post.excerpt.length > 0);
}

export async function fetchTickerPosts(ticker: Ticker): Promise<RawPost[]> {
  const url = TICKER_URLS[ticker];
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    Accept: "text/html,application/xhtml+xml"
  };

  try {
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
    if (posts.length > 0) return posts;
  } catch {
    // Fall through to mirror source when direct site blocks server requests.
  }

  const detailedPosts = await fetchThreadDetailPosts(ticker, url);
  if (detailedPosts.length > 0) return detailedPosts;

  throw new Error("Unable to parse thread list and detailed post content.");
}
