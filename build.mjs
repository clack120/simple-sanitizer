import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "src");
const siteDir = path.join(srcDir, "sites");
const extSrcDir = path.join(root, "extension");
const distDir = path.join(root, "dist");
const userscriptOut = path.join(distDir, "simple-sanitizer.user.js");
const extOutDir = path.join(distDir, "extension");

const pkg = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const version = pkg.version;
const description =
  "주소 유출 등 치명적 실수를 1차 보완하려고 시도합니다. 절대 안전을 보장하지 않습니다.";

const metadata = `// ==UserScript==
// @name         Simple Sanitizer
// @namespace    https://github.com/
// @version      ${version}
// @description  ${description}
// @match        *://*/*
// @run-at       document-start
// @grant        GM_addStyle
// ==/UserScript==
`;

async function buildOnce() {
  const body = await assembleBody();

  await buildUserscript(body);
  await buildExtension(body);

  console.log(`built userscript + extension (v${version})`);
}

async function assembleBody() {
  const core = await readFile(path.join(srcDir, "core.js"), "utf8");
  const config = await readFile(path.join(srcDir, "config.js"), "utf8");
  const siteFiles = (await readdir(siteDir))
    .filter((name) => name.endsWith(".js"))
    .sort((a, b) => a.localeCompare(b));

  const sites = await Promise.all(
    siteFiles.map(async (name) => {
      const source = await readFile(path.join(siteDir, name), "utf8");
      return `\n/* ---- src/sites/${name} ---- */\n${source.trim()}\n`;
    }),
  );

  const configBlock = `\n/* ---- src/config.js ---- */\n${config.trim()}\n`;

  return `(() => {\n  "use strict";\n\n${indent(core.trim(), 2)}\n${indent(
    configBlock,
    2,
  )}\n${sites.map((s) => indent(s, 2)).join("\n")}\n  SimpleSanitizer.run();\n})();\n`;
}

async function buildUserscript(body) {
  await mkdir(distDir, { recursive: true });
  await writeFile(userscriptOut, `${metadata}\n${body}`, "utf8");
}

async function buildExtension(body) {
  await mkdir(extOutDir, { recursive: true });

  const manifest = await readFile(path.join(extSrcDir, "manifest.json"), "utf8");
  await writeFile(
    path.join(extOutDir, "manifest.json"),
    manifest.replace("__VERSION__", version),
    "utf8",
  );

  await writeFile(path.join(extOutDir, "content.js"), body, "utf8");
  await cp(path.join(root, "policy.html"), path.join(extOutDir, "policy.html"));
}

function indent(text, spaces) {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n");
}

if (process.argv.includes("--watch")) {
  await buildOnce();
  const { watch } = await import("node:fs");
  const rebuild = debounce(() => buildOnce().catch(console.error), 80);
  watch(srcDir, { recursive: true }, rebuild);
  watch(extSrcDir, { recursive: true }, rebuild);
  console.log("watching src/, extension/ ...");
} else {
  await buildOnce();
}

function debounce(fn, ms) {
  let timer = null;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}
