SimpleSanitizer.register(
  ({ hostname }) => SimpleSanitizer.hostMatches(hostname, /(^|\.)aliexpress\./),
  ({ addStyle }) => {
    addStyle(`
      div[class^="blurmode--"],
      div[class^="logistic-info-v2--shippingToInfo"],
      div[class^="ship-to--"],
      .pl-address-item-container,
      .pl-clearance-item-container,
      div.subcard-dataPairWrapper,
      .order-detail-info-content:has(.contact-info),
      .order-detail-item-track-info-title,
      div[class*="result-delivery-info--delivery-info--"],
      div[data-spm-anchor-id^="a2g0o.pay_result"][class*="result-delivery-info--delivery-info--"],
      div[class*="my-account--textCenter--"],
      div[class*="my-account--avator--"],
      span[class*="logistic-info-v2--mailNoValue--"],
      span[class*="my-account--small--"][class*="my-account--limitName--"],
      div[class^="concat-carrier--text--"]:has(span[class^="concat-carrier--actionText--"]) {
        display: none !important;
        content-visibility: hidden !important;
      }
    `);
  },
);
