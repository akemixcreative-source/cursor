/**
 * Extract a left-to-right centerline through the Venera wordmark.
 *
 * For each column we look at opaque y-ranges in the alpha channel and pick
 * the band that best continues from the previous column (so the path stays
 * inside the script as it crosses through the V's loop and the connecting
 * cursive joins). Output is a smoothed quadratic SVG path.
 */
import path from "path";
import sharp from "sharp";

const SRC = path.join(
  process.cwd(),
  "public/images/mockups/Logo/venera_transparent.png",
);
const STEP = 4;
const ALPHA_THRESHOLD = 56;

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height } = info;
const stride = 4;

function alpha(x, y) {
  if (x < 0 || y < 0 || x >= width || y >= height) return 0;
  return data[y * width * stride + x * stride + 3];
}

function rangesAtColumn(x) {
  const ranges = [];
  let inBand = false;
  let start = 0;
  for (let y = 0; y < height; y++) {
    const opaque = alpha(x, y) > ALPHA_THRESHOLD;
    if (opaque && !inBand) {
      inBand = true;
      start = y;
    } else if (!opaque && inBand) {
      inBand = false;
      const end = y - 1;
      ranges.push({ start, end, mid: (start + end) / 2, span: end - start + 1 });
    }
  }
  if (inBand) {
    const end = height - 1;
    ranges.push({ start, end, mid: (start + end) / 2, span: end - start + 1 });
  }
  return ranges;
}

let xMin = width;
let xMax = 0;
for (let x = 0; x < width; x += 2) {
  if (rangesAtColumn(x).length > 0) {
    if (x < xMin) xMin = x;
    if (x > xMax) xMax = x;
  }
}

const points = [];
let prevY = null;

for (let x = xMin; x <= xMax; x += STEP) {
  const ranges = rangesAtColumn(x);
  if (ranges.length === 0) continue;

  let chosen;
  if (prevY === null) {
    chosen = ranges.reduce((best, r) => (r.span > best.span ? r : best));
  } else {
    chosen = ranges.reduce((best, r) =>
      Math.abs(r.mid - prevY) < Math.abs(best.mid - prevY) ? r : best,
    );
  }

  if (prevY !== null && Math.abs(chosen.mid - prevY) > 80) {
    chosen = { ...chosen, mid: prevY * 0.6 + chosen.mid * 0.4 };
  }

  points.push({ x, y: chosen.mid });
  prevY = chosen.mid;
}

const smoothed = [];
const window = 2;
for (let i = 0; i < points.length; i++) {
  let sx = 0;
  let sy = 0;
  let n = 0;
  for (let j = Math.max(0, i - window); j <= Math.min(points.length - 1, i + window); j++) {
    sx += points[j].x;
    sy += points[j].y;
    n += 1;
  }
  smoothed.push({ x: sx / n, y: sy / n });
}

let d = "";
for (let i = 0; i < smoothed.length; i++) {
  const p = smoothed[i];
  if (i === 0) {
    d += `M ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  } else if (i === 1) {
    d += ` L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
  } else {
    const prev = smoothed[i - 1];
    const cx = (prev.x + p.x) / 2;
    const cy = (prev.y + p.y) / 2;
    d += ` Q ${prev.x.toFixed(1)} ${prev.y.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
  }
}
const last = smoothed[smoothed.length - 1];
d += ` L ${last.x.toFixed(1)} ${last.y.toFixed(1)}`;

console.log(`viewBox="0 0 ${width} ${height}"`);
console.log(`points=${smoothed.length}`);
console.log(`d="${d}"`);
