import sharp from "sharp";
import { writeFile } from "node:fs/promises";

/**
 * Renders the app icon set from a single square source mark.
 *
 * `icon.png` and `favicon.ico` keep transparency so the mark sits on whatever
 * tab color the browser uses. iOS flattens transparency unpredictably, so
 * `apple-icon.png` is composited on the site background instead.
 */
const SOURCE = process.argv[2];
const SITE_BG = { r: 14, g: 14, b: 14, alpha: 1 };
const ICO_SIZES = [16, 32, 48];

if (!SOURCE) {
  console.error("usage: node scripts/generate-app-icons.mjs <source.png>");
  process.exit(1);
}

/**
 * Smooth gradients compress poorly, and palette quantization dithers them
 * visibly, so keep full color and spend the encoder effort instead.
 */
const square = (size) =>
  sharp(SOURCE)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, effort: 10 });

/** ICO container with PNG-encoded entries (supported by every current browser). */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(16 * images.length);
  let offset = header.length + directory.length;

  images.forEach(({ size, data }, index) => {
    const entry = index * 16;
    directory.writeUInt8(size >= 256 ? 0 : size, entry);
    directory.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    directory.writeUInt8(0, entry + 2);
    directory.writeUInt8(0, entry + 3);
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(data.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });

  return Buffer.concat([
    header,
    directory,
    ...images.map(({ data }) => data),
  ]);
}

await writeFile("app/icon.png", await square(512).toBuffer());

await writeFile(
  "app/apple-icon.png",
  await sharp({
    create: { width: 180, height: 180, channels: 4, background: SITE_BG },
  })
    .composite([{ input: await square(180).toBuffer() }])
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer(),
);

const icoImages = await Promise.all(
  ICO_SIZES.map(async (size) => ({ size, data: await square(size).toBuffer() })),
);
await writeFile("app/favicon.ico", buildIco(icoImages));

console.log(
  JSON.stringify(
    { source: SOURCE, wrote: ["app/icon.png", "app/apple-icon.png", "app/favicon.ico"] },
    null,
    2,
  ),
);
