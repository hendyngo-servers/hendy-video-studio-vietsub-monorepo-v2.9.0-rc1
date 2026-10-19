import { spawn } from "node:child_process";
import { resolve } from "node:path";

export function runExtractor(url: string, projectRoot: string): Promise<{ ok: boolean; text?: string; error?: string }> {
  return new Promise((resolvePromise) => {
    const script = resolve(projectRoot, "pipeline-agent/scripts/scrapy_extract.py");
    const child = spawn(process.env.PYTHON_BIN ?? "python", [script, url], { cwd: projectRoot });
    let output = "";
    child.stdout.on("data", (chunk) => output += chunk.toString());
    child.stderr.on("data", (chunk) => output += chunk.toString());
    child.on("error", (error) => resolvePromise({ ok: false, error: error.message }));
    child.on("close", (code) => {
      if (code !== 0) return resolvePromise({ ok: false, error: output.slice(-2000) });
      try {
        const parsed = JSON.parse(output);
        resolvePromise({ ok: true, text: parsed.text ?? "" });
      } catch {
        resolvePromise({ ok: false, error: "Scrapy output không phải JSON" });
      }
    });
  });
}
