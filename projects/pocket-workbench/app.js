import * as core from './core.js';
const tools = [
  ['json', '{}', 'JSON formatter', 'Data', 'Format and recursively sort keys. Arrays keep their order.', '{"project":"Pocket Workbench","tools":16,"local":true,"tags":["small","useful"]}', text => core.stableJSON(text)],
  ['csv', '≡', 'CSV → JSON', 'Data', 'Quoted fields, escaped quotes, multiline cells, and explicit errors.', 'name,language,stars\nPocket Workbench,JavaScript,128\nCircuit Garden,JavaScript,96', text => core.csvToJSON(text)],
  ['table', '▦', 'Markdown table', 'Data', 'Turn comma-separated rows into a Markdown table.', 'Tool,Category,Offline\nWorkbench,Developer,Yes\nGarden,Electronics,Yes', text => core.markdownTable(text)],
  ['stats', 'Aa', 'Text statistics', 'Text', 'Unicode-aware word and grapheme counts. Reading time at 200 words/minute.', 'Small tools. Clear thinking.\n작은 도구로 만드는 큰 변화. 🌱', text => core.textStats(text)],
  ['case', 'aA', 'Case converter', 'Text', 'Six naming conventions from a single phrase.', 'makeSomethingWonderful', text => core.cases(text)],
  ['diff', '±', 'Line diff', 'Text', 'Compare two versions with a longest common subsequence diff.', 'Keep this line\nImprove this line\nShip it', text => core.diffLines(text, document.querySelector('#secondary').value)],
  ['base64', '64', 'Base64 encode', 'Encoding', 'UTF-8 text to Base64, including emoji and Korean.', 'Hello, 안녕하세요 🌏', text => core.base64Encode(text)],
  ['unbase64', '↶', 'Base64 decode', 'Encoding', 'Decode Base64 into valid UTF-8 text.', 'SGVsbG8sIHdvcmxkIQ==', text => core.base64Decode(text)],
  ['url', '↗', 'URL inspector', 'Encoding', 'Inspect components and preserve repeated query parameters.', 'https://example.com/search?q=small+tools&tag=web&tag=local#results', text => core.inspectURL(text)],
  ['encode', '%', 'URL codec', 'Encoding', 'Encode as a URI component; switch direction with the decode checkbox.', 'hello world / 안녕?', text => document.querySelector('#option').checked ? decodeURIComponent(text) : encodeURIComponent(text)],
  ['hash', '#', 'SHA-256', 'Generate', 'Hash text locally with the browser Web Crypto API.', 'Small tools, big ideas.', text => core.sha256(text)],
  ['uuid', '⤨', 'UUID generator', 'Generate', 'Generate 1–100 random UUID v4 identifiers.', '8', text => { const n = Number(text); if (!Number.isInteger(n) || n < 1 || n > 100) throw new Error('Enter a count from 1 to 100.'); return Array.from({ length: n }, () => crypto.randomUUID()).join('\n'); }],
  ['password', '✳', 'Password generator', 'Generate', 'Random characters with rejection sampling. Nothing is stored.', '24', text => core.securePassword(Number(text))],
  ['time', '◷', 'Timestamp converter', 'Inspect', 'Unix seconds/milliseconds or ISO 8601 with an explicit timezone.', '2026-01-01T00:00:00Z', text => core.timestamp(text)],
  ['color', '◈', 'Color inspector', 'Inspect', 'RGB, HSL, luminance, and WCAG contrast ratios against black/white.', '#8ce9cf', text => core.colorInfo(text)],
  ['jwt', '⌘', 'JWT decoder', 'Inspect', 'Inspect header and payload. This tool does not verify signatures.', 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJkZW1vIiwicm9sZSI6InJlYWRlciJ9.', text => core.decodeJWT(text)]
];
let current = tools[0], sequence = 0;
const drafts = new Map();
document.querySelector('#app').innerHTML = `<div class="layout"><aside><label><span class="sr-only">Find a tool</span><input id="search" placeholder="Find a tool…  /" autocomplete="off"></label><nav aria-label="Tools"></nav><p class="side-note">16 small tools.<br>One quiet workspace.<br><br>Everything runs here, in your browser. No uploads or analytics.</p></aside><main class="content"><div class="hero"><div class="eyebrow">Your everyday toolkit</div><h1>Less friction.<br>More making.</h1><p>The little conversions between an idea and a finished thing. Pick a tool and keep moving.</p></div><section class="panel"><div class="panel-head"><div><div id="category" class="eyebrow"></div><h2 id="title"></h2></div><span class="chip">Runs locally</span></div><p id="description" class="small"></p><div class="grid"><div class="stack"><label>Input<textarea id="input" spellcheck="false"></textarea></label><label id="secondary-label" class="hidden">After<textarea id="secondary" spellcheck="false">Keep this line\nA much better line\nShip it</textarea></label><label id="option-label" class="hidden"><span><input id="option" type="checkbox"> Decode instead of encode</span></label><div class="toolbar"><button id="run" class="primary">Run tool <span aria-hidden="true">↗</span></button><button id="sample" class="ghost">Load example</button></div></div><div class="stack"><div class="toolbar between"><span class="small muted">OUTPUT</span><div class="toolbar"><button id="copy" class="ghost">Copy</button><button id="download" class="ghost">Save</button></div></div><pre id="output" class="output" aria-label="Output" tabindex="0"></pre><div id="swatch" class="hidden"></div></div></div><div id="status" class="status" role="status" aria-live="polite"></div></section><footer>POCKET WORKBENCH / Built for the space between ideas.</footer></main></div>`;
const $ = id => document.getElementById(id);
function renderNav(query = '') {
  const nav = document.querySelector('nav'); nav.replaceChildren();
  for (const t of tools.filter(t => (t[2] + t[3]).toLowerCase().includes(query.toLowerCase()))) {
    const b = document.createElement('button'); b.dataset.tool = t[0]; b.className = t === current ? 'active' : ''; b.setAttribute('aria-pressed', String(t === current));
    const icon = document.createElement('span'); icon.className = 'nav-icon'; icon.textContent = t[1]; b.append(icon, t[2]); b.onclick = () => select(t); nav.append(b);
  }
  if (!nav.children.length) { const p = document.createElement('p'); p.textContent = 'No matching tools.'; nav.append(p); }
}
function select(t) {
  drafts.set(current[0], $('input').value); current = t; location.hash = t[0];
  $('title').textContent = t[2]; $('category').textContent = t[3]; $('description').textContent = t[4]; $('input').value = drafts.get(t[0]) ?? t[5];
  $('secondary-label').classList.toggle('hidden', t[0] !== 'diff'); $('option-label').classList.toggle('hidden', t[0] !== 'encode');
  $('swatch').classList.add('hidden'); renderNav($('search').value); run();
}
async function run() {
  const ticket = ++sequence; $('status').textContent = 'Working…'; $('output').classList.remove('error');
  try {
    if ($('input').value.length > 1_000_000) throw new Error('Input is limited to 1 million characters.');
    const result = await current[6]($('input').value);
    if (ticket !== sequence) return;
    $('output').textContent = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    $('status').textContent = 'Done. Processed on this device.';
    if (current[0] === 'color') { $('swatch').classList.remove('hidden'); $('swatch').style.cssText = `height:56px;border-radius:10px;background:${result.hex}`; }
  } catch (error) { if (ticket !== sequence) return; $('output').textContent = error.message; $('output').classList.add('error'); $('status').textContent = 'Check the input and try again.'; }
}
$('search').oninput = e => renderNav(e.target.value); $('run').onclick = run;
$('sample').onclick = () => { $('input').value = current[5]; run(); };
$('copy').onclick = async () => { try { await navigator.clipboard.writeText($('output').textContent); $('status').textContent = 'Copied to clipboard.'; } catch { $('status').textContent = 'Clipboard unavailable. Select the output and copy manually.'; } };
$('download').onclick = () => { const url = URL.createObjectURL(new Blob([$('output').textContent], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = current[0] + '-output.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
document.addEventListener('keydown', e => { if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); $('search').focus(); } if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); } });
select(tools.find(t => t[0] === location.hash.slice(1)) || tools[0]);
