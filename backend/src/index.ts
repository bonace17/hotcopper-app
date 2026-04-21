import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { dashboardRouter } from "./routes/dashboard";
import { refreshAll } from "./services/refreshService";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", dashboardRouter);

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

async function bootstrap() {
  try {
    await refreshAll();
  } catch {
    // Initial refresh can fail due to network/API issues; endpoints still work.
  }

  setInterval(() => {
    void refreshAll().catch((error) => {
      console.error("Periodic refresh failed:", error);
    });
  }, REFRESH_INTERVAL_MS);

  app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
}

void bootstrap();
