/* =========================================================
   DARE PONG — Trinkspiele Hub: filter + search + sort
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
  const searchEl = document.getElementById("games-search");
  const sortEl = document.getElementById("games-sort");
  const total = cards.length;

  // Pre-parse each card's data once.
  const cardData = cards.map(card => ({
    el: card,
    energy: card.dataset.energy || "",
    min: parseInt(card.dataset.playersMin, 10) || 0,
    max: parseInt(card.dataset.playersMax, 10) || 0,
    durMin: parseInt(card.dataset.durationMin, 10) || 0,
    durMax: parseInt(card.dataset.durationMax, 10) || 0,
    name: card.dataset.name || "",
    tags: (card.dataset.tags || "").split(/\s+/).filter(Boolean),
  }));

  const energyRank = { low: 1, medium: 2, high: 3 };

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
    const active = chips.filter(c => c.getAttribute("aria-pressed") === "true");
    const groups = {};
    active.forEach(chip => {
      (groups[chip.dataset.group] = groups[chip.dataset.group] || []).push(chip);
    });
    const groupKeys = Object.keys(groups);
    const term = (searchEl && searchEl.value || "").trim().toLowerCase();

    let visible = 0;
    cardData.forEach(card => {
      const matchesChips = groupKeys.every(key =>
        groups[key].some(chip => chipMatches(card, chip))
      );
      const matchesTerm = !term || card.name.indexOf(term) !== -1;
      const show = matchesChips && matchesTerm;
      card.el.hidden = !show;
      if (show) visible++;
    });

    const filtering = active.length > 0 || term.length > 0;
    resetBtn.hidden = !filtering;
    noResults.hidden = visible !== 0;
    countEl.textContent = filtering
      ? `${visible} von ${total} Spielen`
      : `${total} Spiele`;
  }

  function sortGrid() {
    const v = sortEl ? sortEl.value : "default";
    const arr = cardData.slice();
    if (v === "players") arr.sort((a, b) => a.max - b.max || a.min - b.min);
    else if (v === "players-desc") arr.sort((a, b) => b.max - a.max || b.min - a.min);
    else if (v === "duration") arr.sort((a, b) => a.durMin - b.durMin || a.durMax - b.durMax);
    else if (v === "energy") arr.sort((a, b) => (energyRank[b.energy] || 0) - (energyRank[a.energy] || 0));
    else if (v === "name") arr.sort((a, b) => a.name.localeCompare(b.name, "de"));
    // else: keep original (default) order
    if (v === "default") {
      cardData.forEach(c => grid.appendChild(c.el));
    } else {
      arr.forEach(c => grid.appendChild(c.el));
    }
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const pressed = chip.getAttribute("aria-pressed") === "true";
      chip.setAttribute("aria-pressed", String(!pressed));
      apply();
    });
  });
  if (searchEl) searchEl.addEventListener("input", apply);
  if (sortEl) sortEl.addEventListener("change", sortGrid);

  function reset() {
    chips.forEach(c => c.setAttribute("aria-pressed", "false"));
    if (searchEl) searchEl.value = "";
    apply();
  }
  resetBtn.addEventListener("click", reset);
  document.querySelectorAll(".games-hub__noresults-reset")
    .forEach(b => b.addEventListener("click", reset));

  // Pre-fill from a ?q= query param (powers the schema.org SearchAction /
  // sitelinks search box and shareable filtered URLs).
  if (searchEl) {
    const q = new URLSearchParams(location.search).get("q");
    if (q) searchEl.value = q;
  }

  apply(); // initialise count
})();
