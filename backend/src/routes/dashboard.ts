import { Router } from "express";
import { memoryStore } from "../services/memoryStore";
import { refreshAll, refreshTicker } from "../services/refreshService";
import { Ticker } from "../types/stock";

export const dashboardRouter = Router();

dashboardRouter.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

dashboardRouter.get("/summary", async (req, res) => {
  try {
    const ticker = String(req.query.ticker || "").toUpperCase() as Ticker;
    if (ticker !== "TGM" && ticker !== "FAU") {
      return res.status(400).json({ error: "ticker must be TGM or FAU" });
    }

    let summary = memoryStore.getSummary(ticker);
    if (!summary) {
      summary = await refreshTicker(ticker);
    }

    return res.json(summary);
  } catch (error) {
    return res.status(502).json({
      error: "Failed to fetch summary",
      detail: error instanceof Error ? error.message : "unknown error"
    });
  }
});

dashboardRouter.get("/dashboard", async (_req, res) => {
  try {
    const snapshot = memoryStore.getDashboard();
    if (!snapshot.TGM || !snapshot.FAU) {
      await refreshAll();
    }
    return res.json({
      updated_at: new Date().toISOString(),
      data: memoryStore.getDashboard()
    });
  } catch (error) {
    return res.status(502).json({
      error: "Failed to build dashboard",
      detail: error instanceof Error ? error.message : "unknown error"
    });
  }
});

dashboardRouter.post("/refresh", async (_req, res) => {
  try {
    await refreshAll();
    return res.json({ ok: true, data: memoryStore.getDashboard() });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      error: "Refresh failed",
      detail: error instanceof Error ? error.message : "unknown error"
    });
  }
});
