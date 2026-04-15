/**
 * Strips white / near-white backgrounds from all monkey PNG assets.
 * Uses pngjs (already in node_modules) — no native deps needed.
 *
 * Run once:  node scripts/make-transparent.js
 */
const fs   = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const MONKEY_DIR = path.join(__dirname, '..', 'assets', 'monkey');
// Pixels with R, G, B all above this value are treated as background white
const THRESHOLD = 235;
// Pixels very close to white but slightly warm/grey (paper texture) also removed
// We use a "distance from white" heuristic
const MAX_DISTANCE = 60;

function isBackground(r, g, b) {
  if (r > THRESHOLD && g > THRESHOLD && b > THRESHOLD) return true;
  // Also catch very light warm paper tones
  const dr = 255 - r;
  const dg = 255 - g;
  const db = 255 - b;
  const dist = Math.sqrt(dr*dr + dg*dg + db*db);
  return dist < MAX_DISTANCE;
}

const files = fs.readdirSync(MONKEY_DIR).filter(f => f.endsWith('.png'));
console.log(`Processing ${files.length} PNG files in ${MONKEY_DIR}\n`);

for (const file of files) {
  const filePath = path.join(MONKEY_DIR, file);
  const src = fs.readFileSync(filePath);
  const png = PNG.sync.read(src);

  let changed = 0;
  for (let y = 0; y < png.height; y++) {
    for (let x = 0; x < png.width; x++) {
      const idx = (png.width * y + x) * 4;
      const r = png.data[idx];
      const g = png.data[idx + 1];
      const b = png.data[idx + 2];
      if (isBackground(r, g, b)) {
        png.data[idx + 3] = 0;   // set alpha to 0
        changed++;
      }
    }
  }

  const out = PNG.sync.write(png);
  fs.writeFileSync(filePath, out);
  console.log(`✓ ${file}  (${changed.toLocaleString()} pixels cleared)`);
}

console.log('\nDone. Rebuild the app to pick up the changes.');
