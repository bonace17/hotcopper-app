import * as cheerio from "cheerio";
import { RawPost, Ticker } from "../types/stock";

const ROW_SELECTORS = [
  ".message-listing",
  ".topic-row",
  "article",
  ".item",
  ".topic-list-item",
  ".hc-topic-row",
  "li[class*='topic']",
  "div[class*='topic']"
];

const LINK_SELECTORS = [
  "h2 a",
  "h3 a",
  ".title a",
  "a.topic-link",
  "a[href*='/threads/']",
  "a[href*='/topic/']",
  "a[href*='/asx/']"
];

function normalizeUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `https://hotcopper.com.au${url.startsWith("/") ? "" : "/"}${url}`;
}

function isLikelyTopicTitle(title: string): boolean {
  return title.length > 8 && !/^(login|sign up|register|hotcopper)$/i.test(title);
}

export function parsePostsFromHtml(html: string, ticker: Ticker): RawPost[] {
  const $ = cheerio.load(html);
  const rows = $(ROW_SELECTORS.join(", "));
  const posts: RawPost[] = [];
  const seen = new Set<string>();

  rows.each((_, row) => {
    const el = $(row);
    const linkEl = el.find(LINK_SELECTORS.join(", ")).first();
    const title = linkEl.text().replace(/\s+/g, " ").trim();
    const url = linkEl.attr("href") || "";
    const author = el.find(".author, .username, .user a").first().text().trim() || "unknown";
    const postedAt = el.find("time").first().attr("datetime") || el.find("time").first().text().trim() || "";
    const excerpt = el.find("p, .excerpt, .message").first().text().replace(/\s+/g, " ").trim();
    const normalizedUrl = normalizeUrl(url);
    const dedupeKey = `${title}|${normalizedUrl}`;

    if (title && isLikelyTopicTitle(title) && !seen.has(dedupeKey)) {
      seen.add(dedupeKey);
      posts.push({
        ticker,
        title,
        author,
        postedAt,
        url: normalizedUrl,
        excerpt
      });
    }
  });

  if (posts.length === 0) {
    $("a[href*='/threads/'], a[href*='/topic/']").each((_, a) => {
      const link = $(a);
      const title = link.text().replace(/\s+/g, " ").trim();
      const normalizedUrl = normalizeUrl(link.attr("href") || "");
      const dedupeKey = `${title}|${normalizedUrl}`;
      if (title && isLikelyTopicTitle(title) && !seen.has(dedupeKey)) {
        seen.add(dedupeKey);
        posts.push({
          ticker,
          title,
          author: "unknown",
          postedAt: "",
          url: normalizedUrl,
          excerpt: ""
        });
      }
    });
  }

  return posts.slice(0, 20);
}
