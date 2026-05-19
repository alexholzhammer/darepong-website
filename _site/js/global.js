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
