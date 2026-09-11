import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distFile = path.join(root, "dist", "simple-sanitizer.user.js");
const port = Number(process.env.PORT || 65534);

createServer(async (_req, res) => {
  try {
    const body = await readFile(distFile, "utf8");
    res.writeHead(200, {
      "content-type": "application/javascript; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(String(err.stack || err));
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`dev server: http://127.0.0.1:${port}/main.js`);
});
