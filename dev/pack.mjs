import { readFile, readdir, writeFile, stat } from "node:fs/promises";
import { deflateRawSync, crc32 } from "node:zlib";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "dist", "extension");
const outFile = path.join(root, "dist", "simple-sanitizer-extension.zip");

async function collect(dir, base = "") {
  const entries = [];
  for (const name of (await readdir(dir)).sort()) {
    const full = path.join(dir, name);
    const rel = base ? `${base}/${name}` : name;
    if ((await stat(full)).isDirectory()) {
      entries.push(...(await collect(full, rel)));
    } else {
      entries.push({ name: rel, data: await readFile(full) });
    }
  }
  return entries;
}

function dosTime(date = new Date()) {
  const time =
    (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >> 1);
  const day =
    ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, day };
}

function zip(entries) {
  const { time, day } = dosTime();
  const locals = [];
  const centrals = [];
  let offset = 0;

  for (const { name, data } of entries) {
    const nameBuf = Buffer.from(name, "utf8");
    const compressed = deflateRawSync(data);
    const crc = crc32(data);

    const local = Buffer.alloc(30 + nameBuf.length);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4); // version needed
    local.writeUInt16LE(0x0800, 6); // utf-8 flag
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(nameBuf.length, 26);
    nameBuf.copy(local, 30);
    locals.push(local, compressed);

    const central = Buffer.alloc(46 + nameBuf.length);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(8, 10);
    central.writeUInt16LE(time, 12);
    central.writeUInt16LE(day, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(compressed.length, 20);
    central.writeUInt32LE(data.length, 24);
    central.writeUInt16LE(nameBuf.length, 28);
    central.writeUInt32LE(offset, 42);
    nameBuf.copy(central, 46);
    centrals.push(central);

    offset += local.length + compressed.length;
  }

  const centralBuf = Buffer.concat(centrals);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...locals, centralBuf, end]);
}

const entries = await collect(srcDir);
if (entries.length === 0) {
  console.error("dist/extension/ 이 비어 있습니다. 먼저 `bun run build` 해야 합니다.");
  process.exit(1);
}
await writeFile(outFile, zip(entries));
console.log(`packed ${entries.length} file(s) -> ${path.relative(root, outFile)}`);
