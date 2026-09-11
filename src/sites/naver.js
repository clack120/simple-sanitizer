SimpleSanitizer.register(
  "naver",
  ({ hostname }) => SimpleSanitizer.hostIs(hostname, "naver.com"),
  ({ addStyle, options }) => {
    addStyle(`
      div[class^="delivery_address"],
      div[class^="DeliveryContent_"],
      div[class^="View_view-value__"],
      #loc-main-section-root {
        display: none !important;
        content-visibility: hidden !important;
      }
    `);

    if (options.hideName) {
      addStyle(`
        [class^="_name-user_"] {
          display: none !important;
          content-visibility: hidden !important;
        }
      `);
    }
  },
);
