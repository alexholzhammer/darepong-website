const { eleventyImageTransformPlugin } = require("@11ty/eleventy-img");
const fs = require("fs");
const path = require("path");
const gameMeta = require("./src/_data/gameMeta.js");

const INPUT_DIR = "src";

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
    const meta = (gameMeta && gameMeta[game.fileSlug]) || {};
    const icon = meta.icon || "🍻";
    const filterAttrs = `data-energy="${d.energyLevel}" `
      + `data-players-min="${d.players.min}" data-players-max="${d.players.max}" `
      + `data-duration-min="${d.duration.min}" data-duration-max="${d.duration.max}" `
      + `data-name="${(d.name || "").toLowerCase().replace(/"/g, "")}" `
      + `data-tags="${tags.join(" ")}"`;

    return `<div class="gp" ${filterAttrs}>
  <div class="gp__inner">
    <span class="gp__icon" aria-hidden="true">${icon}</span>
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

  // Inline a stylesheet from /css straight into the <head>. Eliminates the
  // render-blocking request for the file (the critical FCP lever) — the CSS
  // ships in the HTML document instead of a separate round trip. Reads are
  // cached per build so repeated use across pages stays cheap.
  const cssCache = new Map();
  eleventyConfig.addFilter("inlineCSS", function (name) {
    if (cssCache.has(name)) return cssCache.get(name);
    const file = path.join(__dirname, "css", name);
    const css = fs.readFileSync(file, "utf8");
    cssCache.set(name, css);
    return css;
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
