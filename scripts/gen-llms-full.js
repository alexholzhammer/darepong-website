// Generates llms-full.txt: a single full-text document with the complete
// rules, equipment, tips and FAQ of every game — a citable source for
// AI search engines / LLMs. Run: node scripts/gen-llms-full.js
const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = path.join(__dirname, "..");
const GAMES = path.join(ROOT, "src", "games");
const SITE = "https://www.darepong.eu";

// Order: roughly by search demand / prominence.
const ORDER = [
  "beer-pong", "busfahrer", "kings-cup", "schocken", "maexchen",
  "rage-cage", "flip-cup", "jenga-trinkspiel", "ich-hab-noch-nie",
  "wahrheit-oder-pflicht", "buffalo", "wer-wuerde-eher", "was-wuerdest-du-eher",
];

function load() {
  const files = fs.readdirSync(GAMES).filter(f => f.endsWith(".md"));
  const games = {};
  for (const f of files) {
    const slug = f.replace(/\.md$/, "");
    games[slug] = matter(fs.readFileSync(path.join(GAMES, f), "utf8")).data;
  }
  return games;
}

function section(slug, d) {
  const url = `${SITE}/${d.slug || slug}/`;
  const L = [];
  L.push(`## ${d.name}`);
  L.push("");
  L.push(`- URL: ${url}`);
  L.push(`- Kurzbeschreibung: ${d.shortDescription}`);
  if (d.players) L.push(`- Spieler: ${d.players.min}–${d.players.max}${d.players.ideal ? ` (ideal ${d.players.ideal})` : ""}`);
  if (d.duration) L.push(`- Dauer: ${d.duration.min}–${d.duration.max} Minuten`);
  if (d.location) L.push(`- Ort: ${d.location}`);
  if (d.tags) L.push(`- Tags: ${d.tags.filter(t => t !== "game").join(", ")}`);
  L.push("");
  if (d.equipment && d.equipment.length) {
    L.push("### Equipment");
    d.equipment.forEach(e => L.push(`- ${e.name}${e.note ? ` – ${e.note}` : ""}`));
    L.push("");
  }
  if (d.rules && d.rules.length) {
    L.push(`### ${d.rulesTitle || "Regeln"}`);
    d.rules.forEach((r, i) => L.push(`${i + 1}. ${r}`));
    L.push("");
  }
  if (d.tips && d.tips.length) {
    L.push(`### ${d.tipsTitle || "Tipps"}`);
    d.tips.forEach(t => {
      const title = t.title ? `**${t.title}:** ` : "";
      L.push(`- ${title}${t.text || t}`);
    });
    L.push("");
  }
  if (d.faq && d.faq.length) {
    L.push("### Häufige Fragen");
    d.faq.forEach(q => { L.push(`**${q.q}**`); L.push(q.a); L.push(""); });
  }
  return L.join("\n").trim() + "\n";
}

function main() {
  const games = load();
  const slugs = ORDER.filter(s => games[s]).concat(
    Object.keys(games).filter(s => !ORDER.includes(s))
  );
  const out = [];
  out.push("# Dare Pong — Trinkspiele: vollständige Spielanleitungen");
  out.push("");
  out.push("> Vollständige Regeln, Equipment, Tipps und FAQ zu allen Trinkspielen auf darepong.eu. " +
    "Deutschsprachig, für Erwachsene ab 18 Jahren. Jedes Spiel lässt sich auch alkoholfrei spielen. " +
    "Herausgeber: Spielleute GmbH, Bremen, Deutschland.");
  out.push("");
  out.push(`Kompakte Linkübersicht: ${SITE}/llms.txt · Alle Spiele: ${SITE}/trinkspiele/`);
  out.push("");
  out.push("---");
  out.push("");
  for (const slug of slugs) out.push(section(slug, games[slug]));
  fs.writeFileSync(path.join(ROOT, "llms-full.txt"), out.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n");
  console.log(`llms-full.txt geschrieben (${slugs.length} Spiele).`);
}

main();
