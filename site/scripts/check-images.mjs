// Detect editorial images reused across pages, and keep data/image-bank.json
// in sync with what pages actually use. See docs/IMAGES.md.
//
// Rules:
// - an image may appear only once as visible content across the whole site;
// - <meta>/JSON-LD references don't count (they point at the page's own hero);
// - listing-card thumbnails (.cimg-inner) don't count either: a card is
//   expected to reuse the hero of the article it links to.
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// Brand/UI images that legitimately appear on every page.
const CHROME = /^(favicon-|logo-|ecriture-sans-fond|bout-|cuvee-h)/;

const REF = /(?:\/assets\/images\/|\.\.\/images\/)([A-Za-z0-9_./-]+\.(?:jpe?g|png|webp|avif))/g;

function kindOf(line) {
  if (/<meta\b/.test(line) || /"image"\s*:/.test(line)) return 'meta';
  if (/cimg-inner/.test(line)) return 'card';
  return 'content';
}

async function collectUses() {
  const uses = new Map(); // image -> [{ file, kind }]
  const sources = [];
  for (const dir of ['pages', 'assets/css']) {
    for (const name of await readdir(path.join(siteRoot, dir))) {
      if (/\.(html|css)$/.test(name)) sources.push(path.join(dir, name));
    }
  }
  for (const file of sources) {
    const lines = (await readFile(path.join(siteRoot, file), 'utf8')).split('\n');
    for (const line of lines) {
      // A <picture>'s <source> is a variant of the <img> that follows it, not a second use.
      if (/<source\b/.test(line)) continue;
      for (const [, ref] of line.matchAll(REF)) {
        const image = ref.replace(/\.(webp|avif)$/, '.jpg');
        if (CHROME.test(path.basename(image))) continue;
        if (!uses.has(image)) uses.set(image, []);
        uses.get(image).push({ file, kind: kindOf(line) });
      }
    }
  }
  return uses;
}

async function main() {
  const uses = await collectUses();
  const bank = JSON.parse(await readFile(path.join(siteRoot, 'data/image-bank.json'), 'utf8')).images;
  let problems = 0;

  console.log('Doublons (image visible à plusieurs endroits) :');
  for (const [image, list] of [...uses].sort()) {
    const content = list.filter((u) => u.kind === 'content');
    if (content.length > 1) {
      problems++;
      console.log(`  ✗ ${image}`);
      for (const u of content) console.log(`      ${u.file}`);
    }
  }
  if (!problems) console.log('  aucun');

  console.log('\nBanque d\'images :');
  const free = [];
  for (const img of bank) {
    const key = `banque/${img.id}.jpg`;
    for (const ext of ['jpg', 'webp']) {
      try {
        await access(path.join(siteRoot, 'assets/images/banque', `${img.id}.${ext}`));
      } catch {
        problems++;
        console.log(`  ✗ fichier manquant : banque/${img.id}.${ext}`);
      }
    }
    const usedIn = [...new Set((uses.get(key) || []).filter((u) => u.kind === 'content').map((u) => u.file))];
    if (usedIn.length && !img.reservee) {
      problems++;
      console.log(`  ✗ ${img.id} est utilisée (${usedIn.join(', ')}) mais "reservee" est vide`);
    } else if (!usedIn.length && img.reservee) {
      console.log(`  · ${img.id} réservée pour « ${img.reservee} », pas encore posée`);
    } else if (!usedIn.length) {
      free.push(img);
    }
  }
  console.log(`  ${free.length}/${bank.length} images libres :`);
  for (const img of free) {
    console.log(`    - ${img.id} (${img.orientation}${img.marque ? `, marque : ${img.marque}` : ''})`);
  }

  if (problems) {
    console.log(`\n${problems} problème(s).`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
