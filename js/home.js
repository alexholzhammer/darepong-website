/* =========================================================
   DARE PONG — Home Page Interactions
   ========================================================= */

const DARE_POOL = [
  { id: '042', text: 'Lass Dir beim nächsten Wurf von einem Teammitglied die Augen zuhalten!' },
  { id: '017', text: 'Wirf den Ball mit der schwächeren Hand — und treffe trotzdem!' },
  { id: '088', text: 'Schenke der Person, die Du am attraktivsten findest, Deinen nächsten Wurf!' },
  { id: '004', text: 'Tausche für eine Runde das Shirt mit jemandem aus der gegnerischen Mannschaft.' },
  { id: '063', text: 'Erzähle Deinen peinlichsten Schul-Moment in 20 Sekunden.' },
  { id: '109', text: 'Singe den Refrain Deines Lieblings-Songs — laut, vor allen.' },
  { id: '023', text: 'Der nächste Wurf muss hinter dem Rücken geworfen werden!' },
  { id: '071', text: 'Imitiere eine berühmte Person — Dein Team muss raten, wer es ist.' },
  { id: '055', text: 'Trinke Dein Getränk für den Rest der Runde nur mit der linken Hand.' },
  { id: '097', text: 'Rufe jemanden in Deinen Kontakten an und sage: Ich denke an Dich!' },
];

const CUP_SVG = `<svg class="dare-cell__cup" width="92" height="106" viewBox="0 0 120 140" aria-hidden="true">
  <ellipse cx="60" cy="34" rx="44" ry="8" fill="#FFF7E3"/>
  <path d="M22 34 L98 34 L88 130 L32 130 Z" fill="#E1342B"/>
  <path d="M22 34 L98 34 L96 42 L24 42 Z" fill="#B82822"/>
</svg>`;

let dareState = [null, null, null, null];

function flipDare(index) {
  const cells = document.querySelectorAll('.dare-cell');
  const cell = cells[index];

  if (dareState[index]) {
    dareState[index] = null;
    cell.classList.remove('is-flipped');
    cell.innerHTML = CUP_SVG;
    cell.setAttribute('aria-label', `Becher ${index + 1} umdrehen und Aufgabe aufdecken`);
    return;
  }

  const taken = dareState.filter(Boolean).map(d => d.id);
  const free = DARE_POOL.filter(d => !taken.includes(d.id));
  if (!free.length) return;

  const dare = free[Math.floor(Math.random() * free.length)];
  dareState[index] = dare;
  cell.classList.add('is-flipped');
  cell.setAttribute('aria-label', `Dare ${dare.id}/120: ${dare.text}`);
  cell.innerHTML = `
    <div class="dare-cell__content">
      <span class="dare-cell__id">DARE ${dare.id}/120</span>
      <span class="dare-cell__text">${dare.text}</span>
    </div>`;
}

function resetDares() {
  dareState = [null, null, null, null];
  const cells = document.querySelectorAll('.dare-cell');
  cells.forEach((cell, index) => {
    cell.classList.remove('is-flipped');
    cell.innerHTML = CUP_SVG;
    cell.setAttribute('aria-label', `Becher ${index + 1} umdrehen und Aufgabe aufdecken`);
  });
}

/* ---- Buy Box Quantity ---- */

let buyQty = 1;

function changeQty(delta) {
  buyQty = Math.max(1, buyQty + delta);
  document.getElementById('buy-qty').textContent = buyQty;
  const total = (19.99 * buyQty).toFixed(2).replace('.', ',');
  document.getElementById('buy-price').textContent = `€${total}`;
}

/* ---- Smooth scroll for anchor links ---- */

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 70;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });

      const nav = document.querySelector('.site-header__nav');
      if (nav.classList.contains('is-open')) {
        nav.classList.remove('is-open');
      }
    }
  });
});
