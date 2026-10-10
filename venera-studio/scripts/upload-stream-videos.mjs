/**
 * Upload portfolio films to Cloudflare Stream and print STREAM_VIDEO_MAP for Vercel.
 *
 * Usage:
 *   CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_STREAM_API_TOKEN=... node scripts/upload-stream-videos.mjs
 *
 * Optional: --key appstack-hero  (upload one asset only)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsPath = path.join(root, "data", "videoAssets.ts");

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;

if (!accountId || !apiToken) {
  console.error("Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_STREAM_API_TOKEN.");
  process.exit(1);
}

const onlyKey = process.argv.includes("--key")
  ? process.argv[process.argv.indexOf("--key") + 1]
  : null;

/** Parse fallback paths from videoAssets.ts without a TS loader. */
function loadAssetFallbacks() {
  const source = fs.readFileSync(assetsPath, "utf8");
  const entries = {};
  const blockRe = /"([a-z0-9-]+)":\s*\{\s*fallback:\s*"([^"]+)",/g;
  let match = blockRe.exec(source);
  while (match) {
    entries[match[1]] = match[2];
    match = blockRe.exec(source);
  }
  return entries;
}

async function uploadFile(key, relativePublicPath) {
  const filePath = path.join(root, "public", relativePublicPath.replace(/^\//, "").replace(/%20/g, " "));
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file for ${key}: ${filePath}`);
  }

  const body = new FormData();
  body.append("file", new Blob([fs.readFileSync(filePath)]), path.basename(filePath));
  body.append("meta", JSON.stringify({ name: `venera-${key}` }));
  body.append("requireSignedURLs", "true");

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}` },
      body,
    },
  );

  const json = await res.json();
  if (!json.success) {
    throw new Error(`Upload failed for ${key}: ${JSON.stringify(json.errors ?? json)}`);
  }

  return json.result.uid;
}

const fallbacks = loadAssetFallbacks();
const keys = onlyKey ? [onlyKey] : Object.keys(fallbacks);
const map = {};

for (const key of keys) {
  const rel = fallbacks[key];
  if (!rel) {
    console.warn(`Skip unknown key: ${key}`);
    continue;
  }
  process.stdout.write(`Uploading ${key}… `);
  map[key] = await uploadFile(key, rel);
  console.log(map[key]);
}

console.log("\nAdd to Vercel / .env.local:\n");
console.log(`STREAM_VIDEO_MAP='${JSON.stringify(map)}'`);
console.log(
  "\nAlso set CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN, CLOUDFLARE_STREAM_SIGNING_KEY_ID, CLOUDFLARE_STREAM_SIGNING_KEY_PEM, and STREAM_REQUIRE_SIGNED=1 in production.",
);
