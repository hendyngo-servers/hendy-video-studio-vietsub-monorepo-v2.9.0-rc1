import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("v3 API declares safe health and status endpoints", async () => {
  const source = await readFile(new URL("../src/server.mjs", import.meta.url), "utf8");
  assert.match(source, /app\.get\("\/health"/);
  assert.match(source, /app\.get\("\/api\/v1\/status"/);
  assert.match(source, /app\.disable\("x-powered-by"\)/);
  assert.match(source, /API_ROUTE_NOT_FOUND/);
  assert.doesNotMatch(source, /ADMIN2026|hardcoded-secret/i);
});
