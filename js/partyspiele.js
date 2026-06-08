/* =========================================================
   DARE PONG — Partyspiele Hub filter
   Faceted filtering: OR within a group, AND across groups.
   ========================================================= */
(function () {
  const form = document.getElementById("games-filter");
  const grid = document.getElementById("games-grid");
  if (!form || !grid) return;

  const chips = Array.from(form.querySelectorAll(".games-filter__chip"));
  const cards = Array.from(grid.querySelectorAll(".gp"));
  const countEl = document.getElementById("games-count");
  const resetBtn = document.getElementById("games-reset");
  const noResults = document.getElementById("games-noresults");
  const total = cards.length;

  // Pre-parse each card's filterable data once.
  const cardData = cards.map(card => ({
    el: card,
    energy: card.dataset.energy || "",
    min: parseInt(card.dataset.playersMin, 10) || 0,
    max: parseInt(card.dataset.playersMax, 10) || 0,
    tags: (card.dataset.tags || "").split(/\s+/).filter(Boolean),
  }));

  // Does a card satisfy a single active chip?
  function chipMatches(card, chip) {
    const g = chip.dataset.group;
    if (g === "players") {
      const bMin = parseInt(chip.dataset.min, 10);
      const bMax = parseInt(chip.dataset.max, 10);
      return card.min <= bMax && card.max >= bMin; // ranges overlap
    }
    if (g === "energy") return card.energy === chip.dataset.energy;
    return card.tags.includes(chip.dataset.tag); // art / eigenschaft
  }

  function apply() {
    // Group the active chips by their facet.
    const active = chips.filter(c => c.getAttribute("aria-pressed") === "true");
    const groups = {};
    active.forEach(chip => {
      (groups[chip.dataset.group] = groups[chip.dataset.group] || []).push(chip);
    });
    const groupKeys = Object.keys(groups);

    let visible = 0;
    cardData.forEach(card => {
      // Card shows only if it matches at least one chip in EVERY active group.
      const show = groupKeys.every(key =>
        groups[key].some(chip => chipMatches(card, chip))
      );
      card.el.hidden = !show;
      if (show) visible++;
    });

    const filtering = active.length > 0;
    resetBtn.hidden = !filtering;
    noResults.hidden = visible !== 0;
    countEl.textContent = filtering
      ? `${visible} von ${total} Spielen`
      : `${total} Spiele`;
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const pressed = chip.getAttribute("aria-pressed") === "true";
      chip.setAttribute("aria-pressed", String(!pressed));
      apply();
    });
  });

  function reset() {
    chips.forEach(c => c.setAttribute("aria-pressed", "false"));
    apply();
  }
  resetBtn.addEventListener("click", reset);
  document.querySelectorAll(".games-hub__noresults-reset")
    .forEach(b => b.addEventListener("click", reset));

  apply(); // initialise count
})();
