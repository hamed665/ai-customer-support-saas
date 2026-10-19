import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { build } from "esbuild";

// Keep the hosted demonstration independent of upstream server/provider SDKs.
const output = "dist-demo";
const demo = join(output, "support-demo");
await rm(output, { force: true, recursive: true });
await mkdir(demo, { recursive: true });
const result = await build({
  bundle: true,
  define: { "process.env.NODE_ENV": '"production"' },
  entryNames: "app",
  entryPoints: ["demo-static/main.tsx"],
  format: "esm",
  jsx: "automatic",
  legalComments: "linked",
  metafile: true,
  minify: true,
  outdir: join(demo, "assets"),
  sourcemap: false,
  target: ["es2022"],
});
const inputs = Object.keys(result.metafile.inputs);
for (const input of inputs) {
  assert.ok(
    input.startsWith("demo-static/") ||
      input.startsWith("app/support-demo/") ||
      input.startsWith("lib/support/") ||
      /node_modules\/(?:react|react-dom|scheduler)\//.test(input),
    `Unexpected dependency in hosted demo: ${input}`
  );
}
const policy = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "connect-src 'none'",
  "img-src 'self' data:",
  "font-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta http-equiv="Content-Security-Policy" content="${policy}">
<meta name="description" content="Synthetic multilingual support workflow demo by Hamed Minaei. No AI service or customer system connected.">
<title>Support workspace | Hamed Minaei</title>
<link rel="icon" href="data:,">
<link rel="stylesheet" href="./assets/app.css">
<script type="module" src="./assets/app.js"></script>
</head><body><div id="root"></div>
<noscript>This synthetic support workspace requires JavaScript.</noscript>
</body></html>`;
await writeFile(join(demo, "index.html"), html);
await writeFile(
  join(output, "index.html"),
  '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><title>Support demo</title><p><a href="./support-demo/">Open the synthetic support workspace</a></p></html>'
);
await writeFile(join(output, ".nojekyll"), "");
const require = createRequire(import.meta.url);
const reactDomRequire = createRequire(
  require.resolve("react-dom/package.json")
);
const notices = await Promise.all(
  ["react", "react-dom", "scheduler"].map(async (name) => {
    const manifest = (name === "scheduler" ? reactDomRequire : require).resolve(
      `${name}/package.json`
    );
    return `${name}\n${await readFile(join(dirname(manifest), "LICENSE"), "utf8")}`;
  })
);
await writeFile(
  join(output, "THIRD_PARTY_NOTICES.txt"),
  `${await readFile("NOTICE", "utf8")}\n\n${notices.join("\n\n")}`
);
await writeFile(join(output, "LICENSE"), await readFile("LICENSE"));
await writeFile(
  join(output, "README.txt"),
  "Synthetic local-state support demo by Hamed Minaei. Source and attribution: https://github.com/hamed665/ai-customer-support-saas\nOnly the client support workspace, its engine/fixtures and React runtime are bundled. No original chat backend, BotID, auth, model, storage or customer service is deployed.\n"
);
await writeFile(
  join(output, "bundle-inputs.json"),
  `${JSON.stringify({ inputs: inputs.sort(), networkConnections: "disabled by CSP" }, null, 2)}\n`
);
console.log(
  `Built static support demo from ${inputs.length} allowlisted source files.`
);
