import { mkdir, writeFile, readFile, copyFile } from 'node:fs/promises';
const projects = [
  ['pocket-workbench', 'Pocket Workbench', 'Tools for the small things.', '#8ce9cf', 'Developer utilities that stay in your browser.'],
  ['circuit-garden', 'Circuit Garden', 'Grow your intuition.', '#ffc681', 'Eight interactive electronic circuit experiments.'],
  ['algorithm-arcade', 'Algorithm Arcade', 'Ideas in motion.', '#b9a4ff', 'Six playable windows into algorithms and emergent systems.'],
  ['focus-orbit', 'Focus Orbit', 'Make room for deep work.', '#9bbfff', 'A calm, local-first focus timer, task board, and scratchpad.'],
  ['repo-lantern', 'Repo Lantern', 'See what is in your repository.', '#fa9bb1', 'A read-only, zero-dependency repository inventory CLI.']
];
const license = `MIT License

Copyright (c) 2026 chabin0000

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
const css = `@import url('./theme.css');
:root{color-scheme:dark;--bg:#101311;--panel:#191e1b;--soft:#222a25;--line:#303b34;--text:#ecf2ed;--muted:#a0afa5;--accent:#8ce9cf;--radius:18px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-synthesis:none}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-size:15px;line-height:1.55}button,input,select,textarea{font:inherit}button,a,input,select,textarea{-webkit-tap-highlight-color:transparent}button{cursor:pointer}button,input,select,textarea{border:1px solid var(--line);border-radius:10px;background:var(--soft);color:var(--text)}button{padding:10px 16px;transition:background .15s,transform .15s}button:hover{background:#344238}button:active{transform:translateY(1px)}button:disabled{opacity:.4;cursor:default}button.primary{background:var(--accent);color:#102119;border-color:var(--accent);font-weight:700}button.ghost{background:transparent}input,select,textarea{padding:11px 13px;width:100%;min-width:0}input[type=range]{padding:8px 0;accent-color:var(--accent);background:transparent;border:0}input[type=checkbox]{width:auto;accent-color:var(--accent)}textarea{resize:vertical;min-height:210px;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;line-height:1.7}input:focus,select:focus,textarea:focus{outline:2px solid var(--accent);outline-offset:2px}a{color:var(--accent);text-underline-offset:4px}h1,h2,h3,p{margin-top:0}h1{font-size:clamp(34px,4vw,58px);line-height:1.05;letter-spacing:-2px;font-weight:600;margin-bottom:18px}h2{font-size:24px;font-weight:600;letter-spacing:-.6px}h3{font-size:16px}p{color:var(--muted)}label{display:grid;gap:7px;color:var(--muted);font-size:13px}pre,code{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:0;font-size:13px;line-height:1.8}header{border-bottom:1px solid var(--line)}.topbar{max-width:1440px;margin:auto;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:23px 36px}.brand{display:flex;align-items:center;gap:12px;font-size:17px;font-weight:650;letter-spacing:-.4px;color:var(--text);text-decoration:none}.mark{height:30px;width:30px;display:grid;place-content:center;background:var(--accent);color:#15251b;border-radius:9px;font-size:19px}.badge{display:inline-flex;align-items:center;gap:8px;font-size:11px;text-transform:uppercase;letter-spacing:1.4px;color:var(--muted)}.dot{width:6px;height:6px;background:var(--accent);border-radius:50%}.layout{max-width:1440px;margin:auto;display:grid;grid-template-columns:250px minmax(0,1fr);min-height:calc(100vh - 78px)}aside{padding:30px 22px;border-right:1px solid var(--line)}aside nav{display:grid;gap:5px;margin-top:22px}aside nav button{text-align:left;border:0;background:transparent;padding:12px 13px;color:var(--muted);display:flex;align-items:center;gap:11px}aside nav button.active{background:var(--soft);color:var(--accent)}aside nav button .nav-icon{width:23px;color:var(--accent);font-family:ui-monospace,monospace}.side-label{margin:23px 12px 6px;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:var(--muted)}.side-note{margin:30px 10px 0;padding-top:22px;border-top:1px solid var(--line);font-size:12px}.content{padding:44px 40px;min-width:0}.eyebrow{color:var(--accent);font-size:11px;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px}.hero{margin-bottom:35px;max-width:720px}.hero p{font-size:15px;max-width:580px}.toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:9px}.toolbar.between{justify-content:space-between}.panel{background:var(--panel);border:1px solid var(--line);border-radius:var(--radius);padding:24px;min-width:0}.panel-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:20px}.panel-head h2,.panel-head h3{margin:0}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}.grid.three{grid-template-columns:repeat(3,minmax(0,1fr))}.stack{display:grid;gap:18px}.field-row{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.small{font-size:12px}.muted{color:var(--muted)}.output{min-height:210px;padding:18px;background:#111713;border:1px solid var(--line);border-radius:12px}.error{color:#ffacb4}.status{min-height:24px;margin-top:12px;font-size:12px;color:var(--muted)}.metric{padding:18px;background:var(--soft);border-radius:12px}.metric strong{font-size:27px;font-weight:550;display:block;letter-spacing:-1px}.metric span{font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px}.chip{padding:5px 9px;border:1px solid var(--line);border-radius:20px;color:var(--muted);font-size:11px}.rule{height:1px;background:var(--line);margin:22px 0}canvas{display:block;width:100%;border-radius:12px;background:#101612;touch-action:none}.canvas-wrap{border:1px solid var(--line);border-radius:14px;overflow:hidden;position:relative}.canvas-caption{padding:12px 16px;color:var(--muted);font-size:12px;background:var(--panel);border-top:1px solid var(--line)}.footnote{margin-top:25px;font-size:12px;color:var(--muted)}.hidden{display:none!important}button:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:4px}.sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}footer{padding:25px 0;font-size:11px;color:var(--muted)}
@media(max-width:1050px){.content{padding:32px 24px}.layout{grid-template-columns:210px minmax(0,1fr)}.grid.three{grid-template-columns:1fr 1fr}}@media(max-width:760px){.topbar{padding:18px 20px}.badge{font-size:9px}.layout{display:block}aside{border-right:0;border-bottom:1px solid var(--line);padding:16px 20px}aside nav{display:flex;overflow-x:auto;gap:5px;margin-top:10px;padding:5px 0}aside nav button{flex-shrink:0;padding:9px 11px;font-size:12px}.side-note,.side-label{display:none}.content{padding:30px 20px}.grid,.grid.three{grid-template-columns:1fr}.panel{padding:19px}h1{letter-spacing:-1.5px}.hero{margin-bottom:25px}.field-row{gap:12px}.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
`;
for (const [slug, name, tagline, accent, description] of projects) {
  const path = `projects/${slug}`;
  await mkdir(`${path}/test`, { recursive: true });
  await mkdir(`${path}/.github/workflows`, { recursive: true });
  await writeFile(`${path}/LICENSE`, license);
  await writeFile(`${path}/.gitignore`, 'node_modules/\n.env\n.env.*\ncoverage/\n*.log\n.DS_Store\n');
  await writeFile(`${path}/package.json`, JSON.stringify({ name: slug, version: '1.0.0', type: 'module', description, license: 'MIT', engines: { node: '>=22' }, scripts: { start: 'node serve.mjs', test: 'node --test' }, ...(slug === 'repo-lantern' ? { bin: { 'repo-lantern': './cli.mjs' } } : {}) }, null, 2) + '\n');
  await copyFile('tools/serve.mjs', `${path}/serve.mjs`);
  await writeFile(`${path}/.github/workflows/test.yml`, `name: Test\non: [push, pull_request]\npermissions:\n  contents: read\njobs:\n  test:\n    strategy:\n      matrix:\n        os: [ubuntu-latest, windows-latest]\n        node: [22, 24]\n    runs-on: \u0024{{ matrix.os }}\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: \u0024{{ matrix.node }}\n      - run: npm test\n`);
  if (slug !== 'repo-lantern') {
    await writeFile(`${path}/style.css`, css);
    await writeFile(`${path}/theme.css`, `:root{--accent:${accent}}\n`);
    await writeFile(`${path}/icon.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="${accent}"/><path d="M18 20h28v7H25v10h21v7H18z" fill="#14261b"/></svg>`);
    await writeFile(`${path}/index.html`, `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="${description}"><meta name="theme-color" content="#101311"><title>${name} — ${tagline}</title><link rel="icon" href="./icon.svg"><link rel="stylesheet" href="./style.css"></head><body><header><div class="topbar"><a class="brand" href="./"><span class="mark" aria-hidden="true">▧</span>${name}</a><span class="badge"><i class="dot"></i>Local first · No account</span></div></header><div id="app"></div><script type="module" src="./app.js"></script></body></html>\n`);
  }
}
await writeFile('LICENSE', license);
await writeFile('projects.json', JSON.stringify(projects.map(([slug,name,tagline,accent,description]) => ({slug,name,tagline,accent,description})),null,2)+'\n');
console.log('Scaffolded five independent projects.');
