#!/usr/bin/env node
/**
 * Encode the Meta Ray-Ban hero from a local master export.
 *
 * Tries known paths (Windows drive, repo drop folder), then argv[2].
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ffmpeg = process.env.FFMPEG || "ffmpeg";

const candidates = [
  process.argv[2],
  path.join(root, "Meta AI Glasses.mp4"),
  path.join(root, "public/images/mockups/Meta AI Glasses.mp4"),
  "/mnt/d/Projects/Meta Rayban/EXPORT FINAL/Meta AI Glasses.mp4",
  "/mnt/host/d/Projects/Meta Rayban/EXPORT FINAL/Meta AI Glasses.mp4",
  "D:/Projects/Meta Rayban/EXPORT FINAL/Meta AI Glasses.mp4",
].filter(Boolean);

const source = candidates.find((file) => existsSync(file));

if (!source) {
  console.error(
    "Meta master not found. Drop `Meta AI Glasses.mp4` in venera-studio/ or pass the path.",
  );
  process.exit(2);
}

const desktopOut = path.join(
  root,
  "public/images/mockups/meta-ai-glasses-web.mp4",
);
const mobileOut = path.join(
  root,
  "public/images/mockups/meta-ai-glasses-mobile.mp4",
);
const posterOut = path.join(root, "public/images/posters/meta-rayban-hero.jpg");

function run(args) {
  const result = spawnSync(ffmpeg, args, { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("Encoding Meta film from", source);

run([
  "-y",
  "-i",
  source,
  "-vf",
  "scale=1920:-2:flags=lanczos",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-profile:v",
  "high",
  "-crf",
  "18",
  "-preset",
  "slow",
  "-movflags",
  "+faststart",
  "-c:a",
  "aac",
  "-b:a",
  "160k",
  "-ac",
  "2",
  desktopOut,
]);

run([
  "-y",
  "-i",
  source,
  "-vf",
  "scale=1280:-2:flags=lanczos",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-profile:v",
  "high",
  "-crf",
  "20",
  "-preset",
  "slow",
  "-movflags",
  "+faststart",
  "-c:a",
  "aac",
  "-b:a",
  "128k",
  "-ac",
  "2",
  mobileOut,
]);

run([
  "-y",
  "-ss",
  "1.2",
  "-i",
  source,
  "-frames:v",
  "1",
  "-q:v",
  "3",
  posterOut,
]);

console.log("Wrote", desktopOut);
console.log("Wrote", mobileOut);
console.log("Wrote", posterOut);
