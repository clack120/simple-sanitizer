import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";

const contentScript = readFileSync("dist/extension/content.js", "utf8");

function stylesFor(hostname) {
  const styles = [];
  const parent = {
    appendChild(node) {
      styles.push(node.textContent);
    },
  };
  const document = {
    head: parent,
    documentElement: parent,
    createElement() {
      return { textContent: "" };
    },
  };

  vm.runInNewContext(contentScript, {
    console,
    document,
    location: { hostname },
  });

  return styles.join("\n");
}

function selectorBlocks(css) {
  return [...css.matchAll(/([^{}]+)\{[^{}]*\}/g)].map((match) =>
    match[1].trim(),
  );
}

test("Naver CSS-module classes can appear after another class", () => {
  const css = stylesFor("shopping.naver.com");

  assert.match(css, /div\[class\*="delivery_address"\]/);
  assert.match(css, /\[class\*="_name-user_"\]/);
});

test("AliExpress legacy-safe selectors are isolated from :has()", () => {
  const blocks = selectorBlocks(stylesFor("www.aliexpress.com"));
  const legacyBlock = blocks.find((selector) =>
    selector.includes('div[class*="blurmode--"]'),
  );
  const hasBlock = blocks.find((selector) => selector.includes(":has("));

  assert.ok(legacyBlock);
  assert.doesNotMatch(legacyBlock, /:has\(/);
  assert.ok(hasBlock);
});

test("Firefox minimum version includes :has() support", () => {
  const manifest = JSON.parse(
    readFileSync("dist/extension/manifest.json", "utf8"),
  );

  assert.equal(manifest.browser_specific_settings.gecko.strict_min_version, "121.0");
});
