// Regenerates every icon and the link-preview image from one source SVG.
//
//   npm run icons                      # uses assets/icon-source.svg
//   npm run icons -- path/to/new.svg   # uses (and saves) a new source
//
// The source must be a 128×128 viewBox with the rounded background as
// <rect width="128" height="128" rx="28" fill="#111111"/> (it's stripped and
// re-drawn square for the iPhone/maskable versions).
//
// Outputs:
//   app/icon.svg               browser tab (exact copy of the source)
//   app/favicon.ico            16/32/48 fallback
//   app/apple-icon.png         180×180 full-bleed square (iOS rounds it)
//   app/opengraph-image.png    1200×630 link preview: icon only, dot-grid background
//   public/icons/icon-{192x192,512x512}.png, icon-maskable-512x512.png  Android / PWA
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE = path.join(root, "assets/icon-source.svg");
const BG = "#111111";

const input = process.argv[2] ? path.resolve(process.argv[2]) : SOURCE;
const svg = fs.readFileSync(input, "utf8");
if (input !== SOURCE) fs.copyFileSync(input, SOURCE);

// Artwork without the rounded background square, so it can be re-framed.
const inner = svg
  .replace(/<\?xml[^>]*>/, "")
  .replace(/<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replace(/<title[^>]*>[\s\S]*?<\/title>/, "")
  .replace(/<desc[^>]*>[\s\S]*?<\/desc>/, "")
  .replace(/<rect width="128" height="128" rx="28" fill="#111111"\/>/, "");
if (inner.includes('rx="28"')) throw new Error("Background rect not found in the expected form — see header comment.");

const wrap = (body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">${body}</svg>`;
const fullBleed = wrap(`<rect width="128" height="128" fill="${BG}"/>${inner}`);
// Artwork scaled into the central 80% safe zone so circular masks never clip it.
const maskable = wrap(
  `<rect width="128" height="128" fill="${BG}"/><g transform="translate(12.8 12.8) scale(0.8)">${inner}</g>`
);

const png = (src, size) =>
  sharp(Buffer.from(src), { density: Math.ceil((72 * size) / 128) * 2 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();

// Minimal .ico writer: a directory of PNG-encoded images.
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16);
    e.writeUInt8(size >= 256 ? 0 : size, 0);
    e.writeUInt8(size >= 256 ? 0 : size, 1);
    e.writeUInt16LE(1, 4);
    e.writeUInt16LE(32, 6);
    e.writeUInt32LE(data.length, 8);
    e.writeUInt32LE(offset, 12);
    offset += data.length;
    return e;
  });
  return Buffer.concat([header, ...entries, ...images.map((i) => i.data)]);
}

async function ogImage() {
  const W = 1200;
  const H = 630;
  const iconSize = 300;
  // Same faint dot-matrix grid as the site background.
  const background = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs><pattern id="d" width="24" height="24" patternUnits="userSpaceOnUse">
      <circle cx="12" cy="12" r="1.2" fill="#ffffff" fill-opacity="0.07"/></pattern></defs>
    <rect width="${W}" height="${H}" fill="#000000"/><rect width="${W}" height="${H}" fill="url(#d)"/></svg>`;
  return sharp(Buffer.from(background))
    .composite([
      { input: await png(svg, iconSize), left: (W - iconSize) / 2, top: Math.round((H - iconSize) / 2) },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

const write = (rel, data) => {
  fs.writeFileSync(path.join(root, rel), data);
  console.log(rel.padEnd(40), `${data.length} bytes`);
};

write("app/icon.svg", Buffer.from(svg));
write("app/favicon.ico", ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await png(svg, size) })))));
write("app/apple-icon.png", await png(fullBleed, 180));
write("app/opengraph-image.png", await ogImage());
write("public/icons/icon-192x192.png", await png(svg, 192));
write("public/icons/icon-512x512.png", await png(svg, 512));
write("public/icons/icon-maskable-512x512.png", await png(maskable, 512));
