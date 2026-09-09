import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const out = execSync("node scripts/trace-logo-centerline.mjs", {
  cwd: process.cwd(),
  encoding: "utf8",
});
const m = out.match(/d="([^"]+)"/);
if (!m) {
  console.error(out);
  throw new Error("Could not parse path from centerline trace");
}

const dest = path.join(process.cwd(), "lib/veneraLogoSignaturePath.ts");
const src = `export const VENERA_LOGO_VIEWBOX_WIDTH = 934 as const;
export const VENERA_LOGO_VIEWBOX_HEIGHT = 616 as const;

/**
 * Auto-traced centerline through \`public/images/mockups/Logo/venera_transparent.png\`.
 * Used as the writing path for the SVG mask reveal.
 *
 * Regenerate after swapping the PNG: \`node scripts/emit-signature-path-ts.mjs\`.
 */
export const VENERA_LOGO_SIGNATURE_PATH = ${JSON.stringify(m[1])} as const;
`;

fs.writeFileSync(dest, src, "utf8");
console.log("Wrote", dest);
