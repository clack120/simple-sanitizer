import { spawn } from "node:child_process";

const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const children = [];

function run(name, args) {
  const child = spawn(npm, args, {
    cwd: new URL("..", import.meta.url),
    stdio: "inherit",
    shell: false,
  });

  children.push(child);

  child.on("exit", (code, signal) => {
    if (shuttingDown) return;
    console.log(`[dev] ${name} exited with ${signal || code}`);
    shutdown(code || 1);
  });

  return child;
}

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }

  setTimeout(() => process.exit(code), 150).unref();
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

run("watch", ["run", "watch"]);
run("serve", ["run", "serve"]);
