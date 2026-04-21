export type Ticker = "TGM" | "FAU";

export interface RawPost {
  ticker: Ticker;
  title: string;
  author: string;
  postedAt: string;
  url: string;
  excerpt: string;
}

export interface StockSummary {
  ticker: Ticker;
  ai_summary: string;
  key_points: string[];
  sentiment: "bullish" | "neutral" | "bearish";
  risks: string[];
  catalysts: string[];
  updated_at: string;
}
