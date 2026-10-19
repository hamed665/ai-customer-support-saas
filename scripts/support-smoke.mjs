import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

// Start and probe in the same network namespace; does not need PostgreSQL or AI credentials.
const port = "3199";
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    port,
  ],
  {
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  }
);
let logs = "";
server.stdout.on("data", (data) => {
  logs += data;
});
server.stderr.on("data", (data) => {
  logs += data;
});
try {
  let response;
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Server exited: ${logs}`);
    }
    try {
      // biome-ignore lint/performance/noAwaitInLoops: Server readiness probes must be sequential.
      response = await fetch(`http://127.0.0.1:${port}/support-demo`, {
        signal: AbortSignal.timeout(2000),
      });
      break;
    } catch {
      await setTimeout(200);
    }
  }
  assert.ok(response, `Server did not become ready: ${logs}`);
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const expected of [
    "Support workspace",
    "Demo Shop",
    "Knowledge library",
    "No AI service connected",
  ]) {
    assert.ok(html.includes(expected), `Missing rendered content: ${expected}`);
  }
  const protectedRoute = await fetch(`http://127.0.0.1:${port}/`, {
    redirect: "manual",
  });
  assert.equal(
    protectedRoute.status,
    307,
    "The public demo must not bypass existing auth routes"
  );
  console.log(
    "PASS: built /support-demo renders HTTP 200; existing root retains auth redirect."
  );
} finally {
  server.kill("SIGTERM");
}
