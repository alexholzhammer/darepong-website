/* =========================================================
   DARE PONG — Klaro! configuration (self-hosted CMP)
   Docs: https://klaro.org/docs/configuration-reference/

   GA4 is configured entirely inside the GTM container (GTM-KXSBKFDX) — the
   only service managed here is Google Tag Manager itself. Google Consent
   Mode v2 stays the source of truth for what it's allowed to store:
   darePongLoadGTM() (defined in base.njk) only ever runs once the service
   below has been granted consent.
   ========================================================= */
window.klaroConfig = {
  version: 1,
  elementID: 'klaro',
  htmlTexts: true,
  groupByPurpose: true,
  storageMethod: 'cookie',
  cookieName: 'darepong_consent',
  cookieExpiresAfterDays: 365,
  default: false,
  mustConsent: false,
  // Renders the notice as a centered, page-blocking overlay (dimmed
  // backdrop, no click-outside-to-dismiss) instead of a corner banner —
  // visitors must choose before browsing. Positioning/color come entirely
  // from css/klaro-theme.css, not a built-in Klaro theme.
  noticeAsModal: true,
  acceptAll: true,
  hideDeclineAll: false,
  hideLearnMore: false,
  lang: 'de',

  translations: {
    de: {
      privacyPolicyUrl: '/datenschutz/',
      consentModal: {
        title: 'Cookie-Einstellungen',
        description:
          'Hier können Sie einsehen und anpassen, welche Dienste wir auf darepong.eu einsetzen und welche Daten sie dabei verarbeiten.',
      },
      consentNotice: {
        description:
          'Wir verwenden Cookies, um unsere Website zu betreiben und zu verbessern. Sie entscheiden, welche Kategorien Sie zulassen möchten.',
        learnMore: 'Einstellungen',
      },
      purposes: {
        statistics: 'Statistik',
        marketing: 'Marketing',
      },
      'google-tag-manager': {
        title: 'Google Tag Manager',
        description:
          'Lädt Google Analytics 4 sowie weitere Analyse- und Marketing-Tags nach, sobald Sie zugestimmt haben.',
      },
    },
  },

  services: [
    {
      name: 'google-tag-manager',
      purposes: ['statistics', 'marketing'],
      cookies: [/^_gcl/, /^_ga/, '_gid'],
      onlyOnce: true,
      callback: function (consent) {
        gtag('consent', 'update', {
          ad_storage: consent ? 'granted' : 'denied',
          ad_user_data: consent ? 'granted' : 'denied',
          ad_personalization: consent ? 'granted' : 'denied',
          analytics_storage: consent ? 'granted' : 'denied',
        });
        if (consent && typeof window.darePongLoadGTM === 'function') {
          window.darePongLoadGTM();
        }
      },
    },
  ],
};
