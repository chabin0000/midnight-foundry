import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
let checked = 0;
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (/\.(mjs|js)$/.test(entry.name)) {
      const result = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
      if (result.status) { process.stderr.write(result.stderr); process.exitCode = 1; }
      checked++;
    } else if (entry.name === 'package.json') JSON.parse(await readFile(path, 'utf8'));
  }
}
await walk('.');
console.log(`Checked ${checked} JavaScript modules and all package manifests.`);
