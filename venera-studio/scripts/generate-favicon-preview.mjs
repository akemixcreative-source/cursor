import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";

const SITE_BG = { r: 14, g: 14, b: 14, alpha: 1 };
const SOURCE = "public/images/mockups/Logo/venera-logo.png";
const OUT_DIR = "public/images";

/** Find bounding box of light pixels (white wordmark). */
async function findContentBounds(inputPath) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h } = info;
  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      if (a > 10 && lum > 20) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  return { minX, minY, maxX, maxY, width: w, height: h };
}

async function buildSquareLogo(inputPath, { paddingRatio = 0.1 } = {}) {
  const bounds = await findContentBounds(inputPath);
  const contentW = bounds.maxX - bounds.minX + 1;
  const contentH = bounds.maxY - bounds.minY + 1;

  const padX = Math.round(contentW * paddingRatio);
  const padY = Math.round(contentH * paddingRatio);

  const left = Math.max(0, bounds.minX - padX);
  const top = Math.max(0, bounds.minY - padY);
  const right = Math.min(bounds.width - 1, bounds.maxX + padX);
  const bottom = Math.min(bounds.height - 1, bounds.maxY + padY);

  const cropW = right - left + 1;
  const cropH = bottom - top + 1;
  const squareSize = Math.max(cropW, cropH);

  const cropped = await sharp(inputPath)
    .extract({ left, top, width: cropW, height: cropH })
    .toBuffer();

  const offsetX = Math.floor((squareSize - cropW) / 2);
  const offsetY = Math.floor((squareSize - cropH) / 2);

  const square = await sharp({
    create: {
      width: squareSize,
      height: squareSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: cropped, left: offsetX, top: offsetY, blend: "over" }])
    .png()
    .toBuffer();

  return { square, squareSize, contentW, contentH, cropW, cropH, paddingRatio };
}

async function renderOnSiteBg(squareBuffer, size) {
  const logo = await sharp(squareBuffer)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: SITE_BG,
    },
  })
    .composite([{ input: logo, left: 0, top: 0 }])
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const { square, squareSize, contentW, contentH, paddingRatio } =
    await buildSquareLogo(SOURCE, { paddingRatio: 0.06 });

  const preview512 = await renderOnSiteBg(square, 512);
  const preview64 = await renderOnSiteBg(square, 64);

  const out512 = `${OUT_DIR}/favicon-preview-512.png`;
  const out64 = `${OUT_DIR}/favicon-preview-64.png`;

  await sharp(preview512).toFile(out512);
  await sharp(preview64).toFile(out64);

  console.log(JSON.stringify({
    source: SOURCE,
    contentBounds: { contentW, contentH },
    squareSize,
    paddingRatio,
    outputs: [out512, out64],
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
