// ==UserScript==
// @name         Simple Sanitizer Dev Loader
// @match        *://*/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_addElement
// @connect      127.0.0.1
// @connect      localhost
// ==/UserScript==

"use strict";

(() => {
  const url = `http://127.0.0.1:65534/main.js?t=${Date.now()}`;
  GM_xmlhttpRequest({
    method: "GET",
    url,
    onload(res) {
      if (res.status < 200 || res.status >= 300) {
        console.error("[Simple Sanitizer Dev Loader] HTTP", res.status, url);
        alert(`Simple Sanitizer: ${url}: ${res}`);
        return;
      }
      try {
        if (typeof GM_addElement === "function") {
          GM_addElement("script", { textContent: res.responseText }); // 사이트를 깨기도 함, 특히 svg나 Ctrl+S에서.
        } else {
          Function(res.responseText)();
        }
      } catch (err) {
        console.error("[Simple Sanitizer Dev Loader]", err);
        alert(`Simple Sanitizer: ${err}`);
      }
    },
    onerror(err) {
      console.error("[Simple Sanitizer Dev Loader] load failed", err);
        alert(`Simple Sanitizer: ${err}`);
    },
  });
})();
