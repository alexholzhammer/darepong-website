#!/usr/bin/env node
/* Kopiert das self-hosted Klaro!-Runtime-Bundle aus node_modules in die
   handgepflegten Asset-Ordner (js/, css/), die per Eleventy-Passthrough
   unverändert nach _site/ kopiert werden. Nach einem `npm update klaro`
   erneut ausführen, um die vendored Kopie zu aktualisieren. */
const fs = require('fs');
const path = require('path');

const copies = [
  {
    from: 'node_modules/klaro/dist/klaro-no-css.js',
    to: 'js/klaro.js',
  },
  {
    from: 'node_modules/klaro/dist/klaro.css',
    to: 'css/klaro.css',
  },
];

for (const { from, to } of copies) {
  const src = path.join(__dirname, '..', from);
  const dest = path.join(__dirname, '..', to);
  fs.copyFileSync(src, dest);
  console.log(`[sync-klaro] ${from} -> ${to}`);
}
