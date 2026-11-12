import { readdir, readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
let checked = 0;
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || (dir === '.' && ['projects', 'midnight-labs'].includes(entry.name))) continue;
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
const catalog = JSON.parse(await readFile('catalog.json', 'utf8'));
const pages = (await readdir('apps')).filter(name => name.endsWith('.html'));
if (catalog.length !== pages.length) throw new Error(`Catalog has ${catalog.length} entries but apps/ has ${pages.length} pages.`);
for (const app of catalog) if (!pages.includes(`${app.id}.html`)) throw new Error(`Missing app page: ${app.id}`);
console.log(`Checked ${checked} JavaScript modules, package manifests, and ${catalog.length} catalog links.`);
