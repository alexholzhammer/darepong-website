#!/usr/bin/env node
/* Post-Build-Validierung: tote interne Links/Bilder + JSON-LD-Gültigkeit.
   Beachtet ELEVENTY_PATH_PREFIX (z. B. /darepong-website/ in GitHub Pages).
   Exit-Code 1 bei Fehlern -> bricht CI/Deploy ab. */
const fs = require('fs');
const cp = require('child_process');

const ROOT = '_site';
let prefix = process.env.ELEVENTY_PATH_PREFIX || '/';
if (!prefix.startsWith('/')) prefix = '/' + prefix;
if (!prefix.endsWith('/')) prefix += '/';

if (!fs.existsSync(ROOT)) {
  console.error(`Kein ${ROOT}/ gefunden – bitte zuerst bauen (npm run build).`);
  process.exit(1);
}

const files = cp.execSync(`find ${ROOT} -name "*.html"`).toString().trim().split('\n').filter(Boolean);

function stripPrefix(u) {
  if (prefix !== '/' && u.startsWith(prefix)) return '/' + u.slice(prefix.length);
  if (prefix !== '/' && u === prefix.slice(0, -1)) return '/';
  return u;
}
function exists(u) {
  u = stripPrefix(u).split('#')[0].split('?')[0];
  try { u = decodeURIComponent(u); } catch (e) {}
  if (!u.startsWith('/')) return true;
  const b = ROOT + u;
  if (/\.[a-z0-9]+$/i.test(u)) return fs.existsSync(b);
  if (u.endsWith('/')) return fs.existsSync(b + 'index.html');
  return fs.existsSync(b) || fs.existsSync(b + '/index.html') || fs.existsSync(b + '.html');
}

let ldTotal = 0, ldBad = 0, deadTotal = 0;
const errors = [];
for (const f of files) {
  const h = fs.readFileSync(f, 'utf8');
  const rel = f.replace(ROOT, '');
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    ldTotal++;
    try { JSON.parse(m[1]); } catch (e) { ldBad++; errors.push(`[JSON-LD] ${rel}: ${e.message}`); }
  }
  const urls = new Set([...h.matchAll(/(?:href|src)="(\/[^"]*)"/g)].map(x => x[1]));
  for (const u of urls) {
    if (u.startsWith('//')) continue;
    if (!exists(u)) { deadTotal++; errors.push(`[toter Link] ${rel} -> ${u}`); }
  }
}

console.log(`Seiten: ${files.length} | JSON-LD: ${ldTotal - ldBad}/${ldTotal} valide | tote Links/Bilder: ${deadTotal}`);
if (errors.length) {
  console.error('\nFEHLER:');
  errors.slice(0, 60).forEach(e => console.error('  ' + e));
  if (errors.length > 60) console.error(`  … +${errors.length - 60} weitere`);
  process.exit(1);
}
console.log('✓ Alle Checks bestanden.');
