module.exports = function (eleventyConfig) {
  // Pass through static files unchanged
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("fonts");
  // Copy images co-located with posts to matching /post/ output paths
  eleventyConfig.addPassthroughCopy({ "src/posts": "post" });

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
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
