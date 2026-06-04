const Image = require("@11ty/eleventy-img");
const path = require("path");
const fs = require("fs");

async function responsiveImage(src, alt, sizes, loading, attrs = {}) {
  if (!src) return "";

  // Map output URL path to source file path
  let filePath = src;
  if (src.startsWith("/post/")) {
    filePath = "src/post/" + src.slice("/post/".length);
  } else if (src.startsWith("/assets/")) {
    filePath = "src/assets/" + src.slice("/assets/".length);
  } else if (src.startsWith("/")) {
    filePath = "src" + src;
  }

  if (!fs.existsSync(filePath)) {
    return `<img src="${src}" alt="${alt || ""}" loading="${loading || "lazy"}" decoding="async">`;
  }

  const pathPrefix = process.env.ELEVENTY_PATH_PREFIX || "/";
  const metadata = await Image(filePath, {
    widths: [400, 800, 1200, "auto"],
    formats: ["avif", "webp", "jpeg"],
    outputDir: "./_site/img/",
    urlPath: pathPrefix + "img/",
    filenameFormat: function (id, src, width, format) {
      const name = path.basename(src, path.extname(src));
      return `${name}-${width}.${format}`;
    },
  });

  // Extra attributes (e.g. class, fetchpriority) can be passed as a final object argument.
  return Image.generateHTML(metadata, {
    alt: alt || "",
    sizes: sizes || "(max-width: 800px) 100vw, 800px",
    loading: loading || "lazy",
    decoding: "async",
    ...attrs,
  });
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addAsyncShortcode("responsiveImage", responsiveImage);

  // Pass through static files unchanged
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("fonts");
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

    const tagsHtml = (d.tags || [])
      .map(t => `<span class="gp__tag">${t}</span>`)
      .join("");

    return `<div class="gp">
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
