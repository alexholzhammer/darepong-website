const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const { minify: minifyHtml } = require("html-minifier-terser");
const CleanCSS = require("clean-css");
const fs = require("fs");
const path = require("path");
const gameMeta = require("./src/_data/gameMeta.js");

const INPUT_DIR = "src";
const RUN_MODE = process.env.ELEVENTY_RUN_MODE;
const PRODUCTION = RUN_MODE !== "serve" && RUN_MODE !== "watch";

const cleanCSS = new CleanCSS({});

// Resolve an <img src> to its source file path (mirrors eleventy-img's logic):
// absolute paths are relative to the content dir, relative paths to the template.
function resolveImageSource(src, inputPath) {
  if (!src || /^https?:\/\//i.test(src) || src.startsWith("data:")) return null;
  if (path.isAbsolute(src)) return path.join(INPUT_DIR, src);
  if (inputPath) return path.join(path.dirname(inputPath), src);
  return null;
}

module.exports = function (eleventyConfig) {
  // Guard (runs before the image transform via higher priority): if an <img>
  // points at a missing local source, mark it `eleventy:ignore` so one broken
  // content link can't fail the whole build/deploy. The tag is left untouched
  // (renders as-is) and a warning is logged.
  eleventyConfig.htmlTransformer.addPosthtmlPlugin(
    "html",
    (context) => (tree) => {
      tree.match({ tag: "img" }, (node) => {
        if (!node.attrs || node.attrs["eleventy:ignore"] !== undefined) return node;
        const file = resolveImageSource(node.attrs.src, context.page && context.page.inputPath);
        if (file && !fs.existsSync(file)) {
          node.attrs["eleventy:ignore"] = "";
          console.warn(`[images] Quelle fehlt, übersprungen: ${node.attrs.src} (in ${context.page && context.page.inputPath})`);
        }
        return node;
      });
      return tree;
    },
    { priority: 100 }
  );

  // Optimize every <img> in the rendered HTML automatically: generates AVIF/WebP
  // + srcset and adds intrinsic width/height (prevents CLS). No per-image markup
  // needed — plain <img src> tags and Markdown images are handled.
  // Opt a single image out with the `eleventy:ignore` attribute (e.g. the
  // hand-tuned LCP hero, which is already a pre-optimized AVIF).
  eleventyConfig.addPlugin(eleventyImageTransformPlugin, {
    extensions: "html",
    formats: ["avif", "webp", "jpeg"],
    widths: [400, 800, 1200, "auto"],
    urlPath: "/img/",
    outputDir: "./_site/img/",
    defaultAttributes: {
      loading: "lazy",
      decoding: "async",
      sizes: "(max-width: 800px) 100vw, 800px",
    },
  });

  // Pass through static files unchanged
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("fonts");
  // Favicons + web manifest, served from the site root (/favicon.ico, etc.)
  eleventyConfig.addPassthroughCopy({ "favicons": "/" });
  // Cloudflare redirects (e.g. /partyspiele/ -> /trinkspiele/), served from root
  eleventyConfig.addPassthroughCopy({ "src/_redirects": "_redirects" });
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  // Copy images co-located with posts to matching /post/ output paths
  eleventyConfig.addPassthroughCopy({ "src/post": "post" });

  // Posts collection — newest first
  eleventyConfig.addCollection("posts", function (api) {
    return api.getFilteredByTag("post").sort((a, b) => b.date - a.date);
  });

  // Gift-guide posts (tag "Geschenke") for the /geschenke/ hub + its ItemList schema
  eleventyConfig.addCollection("giftPosts", function (api) {
    return api
      .getFilteredByTag("post")
      .filter((p) => (p.data.tags || []).includes("Geschenke"))
      .sort((a, b) => b.date - a.date);
  });

  // Aggregate stats over a games collection for the hub "Auf einen Blick" box.
  eleventyConfig.addFilter("gamesStats", function (games) {
    let minP = 99, maxP = 0, minD = 999, maxD = 0, om = 0;
    for (const g of games || []) {
      const d = g.data || {};
      if (d.players) { minP = Math.min(minP, d.players.min); maxP = Math.max(maxP, d.players.max); }
      if (d.duration) { minD = Math.min(minD, d.duration.min); maxD = Math.max(maxD, d.duration.max); }
      if ((d.tags || []).includes("ohne-material")) om++;
    }
    return { count: (games || []).length, minP, maxP, minD, maxD, ohneMaterial: om };
  });

  // Related posts by shared tag — for the "Das könnte dich auch interessieren"
  // block. Densifies internal linking across the blog (3 contextual links/post).
  eleventyConfig.addFilter("relatedPosts", function (posts, tags, url) {
    const t = (tags || []).filter((x) => x !== "post");
    return (posts || [])
      .filter(
        (p) =>
          p.url !== url && (p.data.tags || []).some((x) => t.includes(x))
      )
      .slice(0, 3);
  });

  // Games collection
  eleventyConfig.addCollection("games", function (api) {
    return api.getFilteredByTag("game");
  });

  // Game preview card shortcode — usage: {% gamePreview "rage-cage" %}
  eleventyConfig.addShortcode("gamePreview", function (slug) {
    const games = this.ctx && this.ctx.collections && this.ctx.collections.games || [];
    const game = games.find(g => g.fileSlug === slug || (g.data && g.data.slug === slug));
    if (!game) return "";

    const d = game.data;
    const pathPrefix = process.env.ELEVENTY_PATH_PREFIX || "/";
    const url = pathPrefix.replace(/\/$/, "") + game.url;

    const energyLabel = d.energyLevel === "high" ? "Viel Energie"
      : d.energyLevel === "medium" ? "Mittlere Energie" : "Entspannt";

    // Exclude the "game" collection tag (added via games.json) — it's
    // plumbing, not a user-facing category.
    const tags = (d.tags || []).filter(t => t !== "game");
    const tagsHtml = tags
      .map(t => `<span class="gp__tag">${t}</span>`)
      .join("");

    // Data attributes power the filter, search and sort on the hub. Harmless
    // (ignored) when the card is embedded elsewhere, e.g. in blog posts.
    const filterAttrs = `data-energy="${d.energyLevel}" `
      + `data-players-min="${d.players.min}" data-players-max="${d.players.max}" `
      + `data-duration-min="${d.duration.min}" data-duration-max="${d.duration.max}" `
      + `data-name="${(d.name || "").toLowerCase().replace(/"/g, "")}" `
      + `data-tags="${tags.join(" ")}"`;

    return `<div class="gp" ${filterAttrs}>
  <div class="gp__inner">
    <div class="gp__meta">
      <span class="gp__stat"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="6" cy="4" r="2.5" stroke="currentColor" stroke-width="1.5"/><circle cx="11" cy="5.5" r="2" stroke="currentColor" stroke-width="1.5"/><path d="M1 13c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11 10.5c1.4.4 2.5 1.7 2.5 3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>${d.players.min}–${d.players.max} Spieler</span>
      <span class="gp__stat"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.25" stroke="currentColor" stroke-width="1.5"/><path d="M8 5v3.5l2 1.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>${d.duration.min}–${d.duration.max} Min.</span>
      <span class="gp__stat gp__stat--energy-${d.energyLevel}"><svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M9 2L4 9h4l-1 5 5-7H8l1-5z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>${energyLabel}</span>
    </div>
    <h3 class="gp__title">${d.name}</h3>
    <p class="gp__desc">${d.shortDescription}</p>
    ${tagsHtml ? `<div class="gp__tags">${tagsHtml}</div>` : ""}
  </div>
  <a href="${url}" class="gp__cta">Spielanleitung lesen &rarr;</a>
</div>`;
  });

  // German date filter: "12. Mai 2026"
  eleventyConfig.addFilter("dateDE", function (date) {
    return new Date(date).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // ISO date for <time datetime="">
  eleventyConfig.addFilter("dateISO", function (date) {
    return new Date(date).toISOString().split("T")[0];
  });

  // Inject a contextual Dare-Pong call-to-action into rendered post HTML, placed
  // before the middle <h2> so it lands mid-article (never right at the table of
  // contents). `pitch` is a post-specific hook sentence; falls back to a generic
  // line. Returns content unchanged when there are too few headings to place it.
  const CTA_AMZN = "https://amzn.to/4nA0xYQ";
  eleventyConfig.addFilter("injectCta", function (content, pitch) {
    const text =
      pitch ||
      "Bringt Dare Pong mit 120 wasserfesten Dares an euren Beer-Pong-Tisch.";
    const positions = [];
    const re = /<h2\b/g;
    let m;
    while ((m = re.exec(content)) !== null) positions.push(m.index);
    if (positions.length < 2) return content; // not enough structure
    const at = positions[Math.floor(positions.length / 2)];
    const cta =
      '<aside class="inline-cta">' +
      '<div class="inline-cta__body">' +
      '<span class="inline-cta__eyebrow">Tipp für eure Runde</span>' +
      "<p>" +
      text +
      "</p>" +
      "</div>" +
      '<a href="' +
      CTA_AMZN +
      '" class="btn-primary inline-cta__btn" target="_blank" rel="sponsored noopener">Dare Pong ansehen &mdash; &euro;9,97</a>' +
      "</aside>";
    return content.slice(0, at) + cta + content.slice(at);
  });

  // Percent-encode non-ASCII in a URL path (e.g. "ü" -> "%C3%BC") while leaving
  // slashes and already-safe chars untouched. Keeps canonical, og:url, sitemap
  // <loc> and internal links protocol-compliant and consistent. No-op for plain
  // ASCII URLs; safe on already-encoded input (encodeURI leaves "%" alone).
  eleventyConfig.addFilter("encodeUrl", function (urlPath) {
    return encodeURI(urlPath || "");
  });

  // Inline a stylesheet from /css straight into the <head>. Eliminates the
  // render-blocking request for the file (the critical FCP lever) — the CSS
  // ships in the HTML document instead of a separate round trip. Reads are
  // cached per build so repeated use across pages stays cheap.
  const cssCache = new Map();
  eleventyConfig.addFilter("inlineCSS", function (name) {
    if (cssCache.has(name)) return cssCache.get(name);
    const file = path.join(__dirname, "css", name);
    let css = fs.readFileSync(file, "utf8");
    if (PRODUCTION) {
      const out = cleanCSS.minify(css);
      if (out.errors.length) {
        console.warn(`[minify-css] ${name}: ${out.errors.join("; ")}`);
      } else {
        css = out.styles;
      }
    }
    cssCache.set(name, css);
    return css;
  });

  // Minify the final HTML output (production builds only — keeps `--serve`
  // readable). Runs after the image transform and posthtml plugins.
  // Auto-link glossary terms (first occurrence) in game-page prose to the
  // matching glossary anchor on /trinkspiele/. Operates only on game pages and
  // skips text inside links, headings, scripts, nav/figure chrome and the
  // game's own term — so it never double-links or mangles markup.
  const GLOSSARY_LINKS = [
    { re: "Buffalo", slug: "buffalo", self: "buffalo" },
    { re: "Wasserfall", slug: "wasserfall", self: "wasserfall" },
    { re: "Re-Rack", slug: "re-rack" },
    { re: "Death Cup", slug: "death-cup" },
    { re: "Bounce Shot", slug: "bounce-shot" },
    { re: "Schock aus", slug: "schock-aus", self: "schocken" },
    { re: "Mäxchen", slug: "maexchen", self: "maexchen" },
    { re: "Flunkyball", slug: "flunkyball", self: "flunkyball" },
    { re: "Flip Cup", slug: "flip-cup", self: "flip-cup" },
  ];
  eleventyConfig.addTransform("glossaryLinks", function (content) {
    const page = this.page || {};
    if (!page.outputPath || !page.outputPath.endsWith(".html")) return content;
    if (!page.inputPath || !page.inputPath.includes("/games/")) return content;
    const selfSlug = page.fileSlug || "";
    const skip = new Set(["a","h1","h2","h3","h4","script","style","button","dt","dd","figure","figcaption","nav","title","time"]);
    const used = new Set();
    let depth = 0;
    const parts = content.split(/(<[^>]+>)/);
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part.startsWith("<")) {
        const m = part.match(/^<\/?([a-zA-Z0-9]+)/);
        if (m) {
          const tag = m[1].toLowerCase();
          if (skip.has(tag)) {
            if (part[1] === "/") depth = Math.max(0, depth - 1);
            else if (!part.endsWith("/>")) depth++;
          }
        }
        continue;
      }
      if (depth > 0 || !part.trim()) continue;
      let text = part;
      for (const g of GLOSSARY_LINKS) {
        if (used.has(g.slug) || (g.self && g.self === selfSlug)) continue;
        const re = new RegExp("(^|[^\\w-])(" + g.re + ")(?![\\w-])");
        if (re.test(text)) {
          text = text.replace(re, '$1<a class="glossary-link" href="/trinkspiele/#glossar-' + g.slug + '">$2</a>');
          used.add(g.slug);
        }
      }
      parts[i] = text;
    }
    return parts.join("");
  });

  eleventyConfig.addTransform("minifyHtml", async function (content) {
    if (!PRODUCTION || !this.page.outputPath || !this.page.outputPath.endsWith(".html")) {
      return content;
    }
    return minifyHtml(content, {
      collapseWhitespace: true,
      conservativeCollapse: true,
      removeComments: true,
      minifyCSS: true,
      minifyJS: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleLinkTypeAttributes: true,
      useShortDoctype: true,
      keepClosingSlash: true,
    });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    pathPrefix: process.env.ELEVENTY_PATH_PREFIX || "/",
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
