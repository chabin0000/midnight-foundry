/** Pure transformations, shared by the browser and Node's test runner. */
export function stableJSON(text, compact = false) {
  const sort = value => Array.isArray(value) ? value.map(sort) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(k => [k, sort(value[k])])) : value;
  return JSON.stringify(sort(JSON.parse(text)), null, compact ? 0 : 2);
}

export function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  if (!text) return [];
  const rows = []; let row = [], cell = '', quoted = false, closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else cell += c;
    } else if (c === '"') {
      if (cell || closed) throw new Error('Unexpected quote in an unquoted field.');
      quoted = true;
    } else if (c === ',' || c === '\n' || c === '\r') {
      row.push(cell); cell = ''; closed = false;
      if (c !== ',') { rows.push(row); row = []; if (c === '\r' && text[i + 1] === '\n') i++; }
    } else {
      if (closed) throw new Error('Unexpected text after a closing quote.');
      cell += c;
    }
  }
  if (quoted) throw new Error('Unclosed quoted field.');
  if (row.length || cell || closed || text.endsWith(',')) { row.push(cell); rows.push(row); }
  return rows;
}
export function csvToJSON(text) {
  const [headers, ...rows] = parseCSV(text);
  if (!headers) return [];
  if (headers.some(h => !h.trim()) || new Set(headers).size !== headers.length) throw new Error('Use nonempty, unique column headers.');
  return rows.map((row, i) => {
    if (row.length !== headers.length) throw new Error(`Row ${i + 2} has ${row.length} columns; expected ${headers.length}.`);
    return Object.fromEntries(headers.map((h, j) => [h, row[j]]));
  });
}
export function toCSV(rows) { return rows.map(row => row.map(cell => /[",\r\n]/.test(String(cell)) ? '"' + String(cell).replaceAll('"', '""') + '"' : String(cell)).join(',')).join('\r\n'); }
export function textStats(text) {
  const graphemes = [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)];
  const words = [...new Intl.Segmenter(undefined, { granularity: 'word' }).segment(text)].filter(s => s.isWordLike);
  return { graphemes: graphemes.length, codePoints: [...text].length, words: words.length, lines: text ? text.split(/\r\n|\r|\n/).length : 0, bytes: new TextEncoder().encode(text).length, readingMinutes: Math.ceil(words.length / 200) };
}
export function cases(text) {
  const parts = text.replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').match(/[\p{L}\p{N}]+/gu) || [];
  const words = parts.map(s => s.toLowerCase());
  const title = s => s ? s[0].toUpperCase() + s.slice(1) : s;
  return { camelCase: words.map((s, i) => i ? title(s) : s).join(''), PascalCase: words.map(title).join(''), snake_case: words.join('_'), 'kebab-case': words.join('-'), CONSTANT_CASE: words.join('_').toUpperCase(), 'Title Case': words.map(title).join(' ') };
}
export function base64Encode(text) { return btoa(Array.from(new TextEncoder().encode(text), b => String.fromCharCode(b)).join('')); }
export function base64Decode(text) { return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(text.trim()), c => c.charCodeAt(0))); }
export function inspectURL(text) {
  const u = new URL(text.trim());
  return { protocol: u.protocol, hostname: u.hostname, port: u.port, pathname: u.pathname, parameters: [...u.searchParams].map(([key, value]) => ({ key, value })), hash: u.hash, origin: u.origin };
}
export async function sha256(text) { const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)); return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join(''); }
export function timestamp(text) {
  const input = text.trim(); let date;
  if (/^-?\d+$/.test(input)) {
    const n = Number(input);
    if (!Number.isSafeInteger(n)) throw new Error('Timestamp is outside the safe integer range.');
    date = new Date(Math.abs(n) < 1e11 ? n * 1000 : n);
  } else {
    if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d(?::\d\d(?:\.\d{1,3})?)?(?:Z|[+-]\d\d:\d\d)$/.test(input)) throw new Error('Use ISO 8601 with Z or an explicit offset, or an integer Unix timestamp.');
    date = new Date(input);
  }
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid date or timestamp.');
  return { utc: date.toISOString(), local: date.toString(), unixSeconds: Math.floor(date.getTime() / 1000), unixMilliseconds: date.getTime() };
}
export function colorInfo(hex) {
  hex = hex.trim().replace(/^#/, '');
  if (/^[\da-f]{3}$/i.test(hex)) hex = [...hex].map(c => c + c).join('');
  if (!/^[\da-f]{6}$/i.test(hex)) throw new Error('Enter a 3- or 6-digit hex color.');
  const rgb = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16));
  const [r, g, b] = rgb.map(c => c / 255), max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  let h = !d ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  const linear = [r, g, b].map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  const luminance = linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
  return { hex: '#' + hex.toLowerCase(), rgb: `rgb(${rgb.join(', ')})`, hsl: `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`, luminance, contrastOnBlack: (luminance + .05) / .05, contrastOnWhite: 1.05 / (luminance + .05) };
}
export function gradient(a, b, angle = 135) { return `linear-gradient(${Number(angle)}deg, ${colorInfo(a).hex}, ${colorInfo(b).hex})`; }
export function markdownTable(text) {
  const rows = parseCSV(text);
  if (!rows.length) return '';
  const size = rows[0].length;
  if (rows.some(r => r.length !== size)) throw new Error('All rows must have the same number of columns.');
  const line = r => '| ' + r.map(c => c.replaceAll('\\', '\\\\').replaceAll('|', '\\|').replace(/\r?\n/g, '<br>')).join(' | ') + ' |';
  return [line(rows[0]), line(Array(size).fill('---')), ...rows.slice(1).map(line)].join('\n');
}
export function diffLines(before, after) {
  const a = before.split('\n'), b = after.split('\n');
  if (a.length * b.length > 500000) throw new Error('Diff is limited to 500,000 line pairs. Split your input.');
  const dp = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) { out.push('  ' + a[i]); i++; j++; }
    else if (j < b.length && (i === a.length || dp[i][j + 1] >= dp[i + 1][j])) out.push('+ ' + b[j++]);
    else out.push('- ' + a[i++]);
  }
  return out.join('\n');
}
export function securePassword(length = 24, alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*+-=?') {
  if (!Number.isInteger(length) || length < 8 || length > 256) throw new Error('Length must be an integer from 8 to 256.');
  const chars = [...alphabet];
  if (chars.length < 2 || chars.length > 256 || new Set(chars).size !== chars.length) throw new Error('Alphabet must contain 2–256 unique characters.');
  const limit = 256 - 256 % chars.length; let out = '';
  while (out.length < length) for (const byte of crypto.getRandomValues(new Uint8Array(64))) { if (byte < limit) out += chars[byte % chars.length]; if (out.length === length) break; }
  return out;
}
export function decodeJWT(text) {
  const parts = text.trim().split('.');
  if (parts.length !== 3) throw new Error('Expected three dot-separated JWT segments.');
  const decode = part => JSON.parse(base64Decode(part.replaceAll('-', '+').replaceAll('_', '/')));
  return { header: decode(parts[0]), payload: decode(parts[1]), signature: 'NOT VERIFIED — decoding does not validate authenticity or expiry.' };
}
