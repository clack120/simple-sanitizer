import { execFile } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const roots = ["build.mjs", "dev", "src", "scripts"];
const files = [];

for (const root of roots) {
  await collect(path.resolve(root));
}

for (const file of files.sort()) {
  try {
    await execFileAsync(process.execPath, ["--check", file]);
    console.log(`syntax ok: ${path.relative(process.cwd(), file)}`);
  } catch (error) {
    console.error(`syntax error: ${path.relative(process.cwd(), file)}`);
    if (error.stderr) console.error(error.stderr.trim());
    process.exitCode = 1;
    break;
  }
}

async function collect(target) {
  const info = await stat(target);

  if (info.isFile()) {
    if (target.endsWith(".js") || target.endsWith(".mjs")) files.push(target);
    return;
  }

  for (const entry of await readdir(target, { withFileTypes: true })) {
    await collect(path.join(target, entry.name));
  }
}
