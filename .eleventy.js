const Image = require("@11ty/eleventy-img");
const path = require("path");
const fs = require("fs");

async function responsiveImage(src, alt, sizes, loading) {
  if (!src) return "";
  const filePath = src.startsWith("/") ? path.join("src", src) : src;
  if (!fs.existsSync(filePath)) {
    return `<img src="${src}" alt="${alt || ""}" loading="${loading || "lazy"}" decoding="async">`;
  }
  const pathPrefix = process.env.ELEVENTY_PATH_PREFIX || "/";
  const metadata = await Image(filePath, {
    widths: [400, 800, 1200, "auto"],
    formats: ["webp", "jpeg"],
    outputDir: "./_site/img/",
    urlPath: pathPrefix + "img/",
  });
  return Image.generateHTML(metadata, {
    alt: alt || "",
    sizes: sizes || "(max-width: 800px) 100vw, 800px",
    loading: loading || "lazy",
    decoding: "async",
  });
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addNunjucksAsyncShortcode("responsiveImage", responsiveImage);

  // Pass through static files unchanged
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("fonts");
  // Pass through post co-located images; markdown files are processed as templates
  eleventyConfig.addPassthroughCopy({ "src/post": "post" });

  // Posts collection — newest first
  eleventyConfig.addCollection("posts", function (api) {
    return api.getFilteredByTag("post").sort((a, b) => b.date - a.date);
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
