import express from "express";
import cors from "cors";
import helmet from "helmet";
import { createServer } from "node:http";

const app = express();
const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const serviceName = process.env.SERVICE_NAME ?? "hendy-vietsub-platform-v3";
const startedAt = Date.now();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",").map((value) => value.trim()).filter(Boolean)
    : false,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  maxAge: 600,
}));
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT ?? "2mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: serviceName,
    version: process.env.APP_VERSION ?? "3.0.0-rc.1",
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/v1/status", (_req, res) => {
  res.set("Cache-Control", "no-store").json({
    ok: true,
    service: serviceName,
    version: process.env.APP_VERSION ?? "3.0.0-rc.1",
    capabilities: {
      subtitleWorkspace: true,
      asynchronousJobs: false,
      objectStorage: Boolean(process.env.R2_BUCKET),
      aiTranslation: Boolean(process.env.GEMINI_API_KEY),
    },
  });
});

app.use("/api", (_req, res) => {
  res.status(404).json({ ok: false, error: "API_ROUTE_NOT_FOUND" });
});

app.use((error, _req, res, _next) => {
  const status = Number.isInteger(error?.status) && error.status >= 400 && error.status < 600 ? error.status : 500;
  if (status >= 500) console.error("Unhandled request error", error?.message ?? "unknown error");
  res.status(status).json({
    ok: false,
    error: status === 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR",
    message: status === 500 ? "An unexpected server error occurred." : String(error?.message ?? "Invalid request"),
  });
});

const server = createServer(app);
server.listen(port, "0.0.0.0", () => {
  console.log(serviceName + " listening on 0.0.0.0:" + port);
});

function shutdown(signal) {
  console.log("Received " + signal + "; shutting down gracefully");
  server.close((error) => {
    if (error) {
      console.error("Shutdown failed", error.message);
      process.exitCode = 1;
    }
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
