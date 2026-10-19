import { WebSocketServer } from "ws";
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { resolve } from "node:path";
import { runExtractor } from "./extractor.js";

const port = Number(process.env.PIPELINE_PORT ?? 8799);
const projectRoot = resolve(process.env.PROJECT_ROOT ?? process.cwd());
const wss = new WebSocketServer({ host: "127.0.0.1", port });

function send(ws: any, event: unknown) {
  ws.send(JSON.stringify(event));
}

function run(command: string, args: string[], cwd = projectRoot): Promise<{ ok: boolean; output: string }> {
  return new Promise((resolvePromise) => {
    const child = spawn(command, args, { cwd, shell: false });
    let output = "";
    child.stdout.on("data", (chunk) => output += chunk.toString());
    child.stderr.on("data", (chunk) => output += chunk.toString());
    child.on("error", (error) => resolvePromise({ ok: false, output: error.message }));
    child.on("close", (code) => resolvePromise({ ok: code === 0, output }));
  });
}

wss.on("connection", (ws) => {
  send(ws, { type: "hello", port, projectRoot });
  ws.on("message", async (raw) => {
    try {
      const message = JSON.parse(raw.toString()) as { action?: string; url?: string };
      if (message.action === "dry-run") {
        const result = await run("npm", ["run", "dry-run"], resolve(projectRoot, "pipeline-ui"));
        send(ws, { type: "dry-run", status: result.ok ? "PASS" : "FAIL", output: result.output.slice(-5000) });
        return;
      }
      if (message.action === "extract" && message.url) {
        send(ws, { type: "extract:start", url: message.url });
        send(ws, { type: "extract:result", ...(await runExtractor(message.url, projectRoot)) });
        return;
      }
      send(ws, { type: "error", message: "Unknown action" });
    } catch (error) {
      send(ws, { type: "error", message: error instanceof Error ? error.message : String(error) });
    }
  });
});

console.log(`Pipeline Agent listening on ws://127.0.0.1:${port}`);
console.log(`Project root: ${projectRoot}`);
await access(projectRoot);
