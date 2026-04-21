import { RawPost, StockSummary, Ticker } from "../types/stock";

type RawCache = Record<Ticker, RawPost[]>;
type SummaryCache = Record<Ticker, StockSummary | null>;

class MemoryStore {
  private rawPosts: RawCache = { TGM: [], FAU: [] };
  private summaries: SummaryCache = { TGM: null, FAU: null };

  setPosts(ticker: Ticker, posts: RawPost[]) {
    this.rawPosts[ticker] = posts;
  }

  getPosts(ticker: Ticker): RawPost[] {
    return this.rawPosts[ticker];
  }

  setSummary(ticker: Ticker, summary: StockSummary) {
    this.summaries[ticker] = summary;
  }

  getSummary(ticker: Ticker): StockSummary | null {
    return this.summaries[ticker];
  }

  getDashboard() {
    return {
      TGM: this.summaries.TGM,
      FAU: this.summaries.FAU
    };
  }
}

export const memoryStore = new MemoryStore();
