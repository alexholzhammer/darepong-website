/* =========================================================
   DARE PONG — Shared interactions (loaded on every page)
   ========================================================= */

function toggleFaq(btn) {
  const item = btn.closest('.faq__item');
  const wasOpen = item.classList.contains('is-open');
  document.querySelectorAll('.faq__item.is-open').forEach(el => {
    el.classList.remove('is-open');
  });
  if (!wasOpen) item.classList.add('is-open');
}

/* ---- Nav dropdown (Partyspiele) ---- */
document.querySelectorAll('.nav-dropdown').forEach(dd => {
  const toggle = dd.querySelector('.nav-dropdown__toggle');
  if (!toggle) return;

  const close = () => {
    dd.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  const open = () => {
    dd.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  };

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    dd.classList.contains('is-open') ? close() : open();
  });

  // Close on outside click and on Escape (returning focus to the toggle).
  document.addEventListener('click', e => {
    if (!dd.contains(e.target)) close();
  });
  dd.addEventListener('keydown', e => {
    if (e.key === 'Escape' && dd.classList.contains('is-open')) {
      close();
      toggle.focus();
    }
  });
});
