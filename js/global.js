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

/* ---- Lazy YouTube facade: load the player only on click (no 3rd-party
   cookies until the visitor interacts) ---- */
function loadYouTube(btn) {
  const wrap = btn.parentNode;
  const id = wrap.getAttribute('data-ytid');
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
  iframe.title = 'Beer Pong Regeln Video';
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  wrap.replaceChild(iframe, btn);
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
