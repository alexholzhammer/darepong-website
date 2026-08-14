/* =========================================================
   DARE PONG — Klaro! configuration (self-hosted CMP)
   Docs: https://klaro.org/docs/configuration-reference/

   Google Consent Mode v2 stays the source of truth for what GTM/GA4 are
   allowed to store: darePongLoadGTM() and the "google-analytics" script
   tags (both defined in base.njk) only ever start once the matching
   service below has been granted consent.
   ========================================================= */
window.klaroConfig = {
  version: 1,
  elementID: 'klaro',
  styling: { theme: ['dark', 'bottom', 'wide'] },
  htmlTexts: true,
  groupByPurpose: true,
  storageMethod: 'cookie',
  cookieName: 'darepong_consent',
  cookieExpiresAfterDays: 365,
  default: false,
  mustConsent: false,
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
      'google-analytics': {
        title: 'Google Analytics 4',
        description:
          'Erfasst anonymisierte Statistiken zur Nutzung unserer Website (z. B. Seitenaufrufe, Verweildauer, Herkunft).',
      },
      'google-tag-manager': {
        title: 'Google Tag Manager',
        description:
          'Lädt weitere Analyse- und Marketing-Tags nach, sobald Sie zugestimmt haben.',
      },
    },
  },

  services: [
    {
      name: 'google-analytics',
      purposes: ['statistics'],
      cookies: [/^_ga/, '_gid'],
      onlyOnce: true,
      callback: function (consent) {
        gtag('consent', 'update', {
          analytics_storage: consent ? 'granted' : 'denied',
        });
      },
    },
    {
      name: 'google-tag-manager',
      purposes: ['statistics', 'marketing'],
      cookies: [/^_gcl/, /^_ga/],
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
