SimpleSanitizer.register(
  "google",
  ({ hostname }) =>
    SimpleSanitizer.hostMatches(
      hostname,
      /(^|\.)google\.(?:com|[a-z]{2,3}|co\.[a-z]{2}|com\.[a-z]{2})$/,
  ),
  ({ addStyle }) => {
    addStyle(`
      /* The footer location controls are in a button-only row. Keep the
         neighboring footer links and the rest of the footer intact. */
      #fbar > :has(button):not(:has(a)) {
        display: none !important;
        content-visibility: hidden !important;
      }

      /* Map surfaces have a language-independent Maps embed URL or contain
         the Maps terms link. Do not hide the place-list/result parent. */
      iframe[src*="google.com/maps"],
      iframe[src*="maps.google."],
      [role="application"]:has(a[href*="terms_maps"]) {
        display: none !important;
        content-visibility: hidden !important;
      }
    `);
  },
);
