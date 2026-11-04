/* =========================================================
   DARE PONG — Google Ads Landing Page
   Shows the mobile buy bar once the hero button has scrolled away,
   and hides it again at the final button.
   ========================================================= */
(function () {
  var bar = document.getElementById('lp-sticky');
  var hero = document.getElementById('hero-cta');
  var finalCta = document.getElementById('final-cta');
  if (!bar || !hero || !finalCta || !('IntersectionObserver' in window)) return;

  var heroVisible = true;
  var finalVisible = false;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.target === hero) heroVisible = entry.isIntersecting;
      if (entry.target === finalCta) finalVisible = entry.isIntersecting;
    });
    bar.classList.toggle('is-visible', !heroVisible && !finalVisible);
  });

  observer.observe(hero);
  observer.observe(finalCta);
})();
