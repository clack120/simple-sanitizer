SimpleSanitizer.register(
  "google",
  ({ hostname }) =>
    SimpleSanitizer.hostMatches(
      hostname,
      /(^|\.)google\.(?:com|[a-z]{2,3}|co\.[a-z]{2}|com\.[a-z]{2})$/,
    ),
  ({ addStyle }) => {
    addStyle(`
      /* Maps are exposed as a region, with data-idm on the embedded map
         variant. The terms-link fallback covers the other SERP map layout. */
      [role="region"][data-idm],
      [role="region"]:has(a[href*="terms_maps"]),
      div:has(> a[href*="udm=local"]),
      div:has(> a[data-url*="udm=local"]) {
        display: none !important;
        content-visibility: hidden !important;
      }

      /* A place card groups its interactive place item with direct Maps
         actions. This uses roles and link destinations, not translated text. */
      div:not(#rso):not(#rcnt):has([role="button"]):has(
        > a[href*="/maps/dir/"],
        > a[data-url*="/maps/dir/"],
        > a[href^="/maps/"],
        > a[href*="google."][href*="/maps/"]
      ) {
        display: none !important;
        content-visibility: hidden !important;
      }

      /* Local-results location controls sit beside a heading, outside the
         footer. Match the heading and control row by their semantic roles. */
      div[role="heading"]:has(+ div > a[href="#"][role="button"]),
      div:has(> span + a[href="#"][role="button"]) {
        display: none !important;
        content-visibility: hidden !important;
      }

      /* Hide the footer location control, locality link, and country label. */
      #fbar update-location,
      #fbar a[href="#"][role="button"],
      #fbar span:has(+ div update-location) {
        display: none !important;
        content-visibility: hidden !important;
      }
    `);
  },
);
