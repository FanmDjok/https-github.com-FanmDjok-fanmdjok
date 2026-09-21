// Génère les icônes PWA à partir d'un unique SVG source : fond émeraude, un
// carré papier centré (le clin d'œil au point du "i" du logo growthis).
// À relancer avec `node scripts/generate-icons.mjs` si le tracé change.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const EMERALD = "#0E8A5F";
const PAPER = "#F5F5F1";

function svg({ size, dotRatio }) {
  const dot = size * dotRatio;
  const offset = (size - dot) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${EMERALD}" />
  <rect x="${offset}" y="${offset}" width="${dot}" height="${dot}" rx="${dot * 0.18}" fill="${PAPER}" />
</svg>`;
}

const outDir = new URL("../public/icons/", import.meta.url);
mkdirSync(outDir, { recursive: true });

const targets = [
  { name: "icon-192.png", size: 192, dotRatio: 0.42 },
  { name: "icon-512.png", size: 512, dotRatio: 0.42 },
  { name: "icon-maskable-512.png", size: 512, dotRatio: 0.32 },
  { name: "apple-touch-icon.png", size: 180, dotRatio: 0.42 },
];

for (const target of targets) {
  const markup = svg(target);
  await sharp(Buffer.from(markup)).png().toFile(fileURLToPath(new URL(target.name, outDir)));
  console.log(`Généré ${target.name}`);
}

writeFileSync(fileURLToPath(new URL("icon.svg", outDir)), svg({ size: 512, dotRatio: 0.42 }));
console.log("Généré icon.svg");
