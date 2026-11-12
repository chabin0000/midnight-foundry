// Pure transformations shared by the browser, CLI, and test suite.
export function formatJSON(text, indent = 2) { return JSON.stringify(JSON.parse(text), null, indent); }

export function parseCSV(text, delimiter = ',') {
  if (delimiter.length !== 1 || /["\r\n]/.test(delimiter)) throw new Error('Choose a single delimiter other than a quote or newline.');
  text = text.replace(/^\uFEFF/, '');
  if (!text) return [];
  const rows = []; let row = [], field = '', quoted = false, closed = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { quoted = false; closed = true; }
      else field += c;
    } else if (c === '"') {
      if (field || closed) throw new Error(`Unexpected quote at character ${i + 1}.`);
      quoted = true;
    } else if (c === delimiter) { row.push(field); field = ''; closed = false; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = ''; closed = false;
    } else {
      if (closed) throw new Error(`Unexpected text after closing quote at character ${i + 1}.`);
      field += c;
    }
  }
  if (quoted) throw new Error('Unclosed quoted CSV field.');
  if (field || row.length || closed || !/[\r\n]$/.test(text)) { row.push(field); rows.push(row); }
  return rows;
}
export function stringifyCSV(rows, delimiter = ',') {
  return rows.map(row => row.map(value => {
    const s = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
    return s.includes(delimiter) || /["\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  }).join(delimiter)).join('\r\n');
}
export function csvToJSON(text, delimiter = ',') {
  const [headers, ...rows] = parseCSV(text, delimiter);
  if (!headers) return [];
  if (new Set(headers).size !== headers.length || headers.some(h => !h)) throw new Error('Column headers must be nonempty and unique.');
  return rows.map((row, i) => {
    if (row.length !== headers.length) throw new Error(`Row ${i + 2} has ${row.length} fields; expected ${headers.length}.`);
    return Object.fromEntries(headers.map((key, n) => [key, row[n]]));
  });
}
export function jsonToCSV(text) {
  const rows = typeof text === 'string' ? JSON.parse(text) : text;
  if (!Array.isArray(rows) || rows.some(row => !row || typeof row !== 'object' || Array.isArray(row))) throw new Error('Expected an array of objects.');
  const headers = [...new Set(rows.flatMap(Object.keys))];
  return stringifyCSV([headers, ...rows.map(row => headers.map(key => row[key]))]);
}
export function textStats(text) {
  const words = text.trim().match(/\S+/gu) ?? [];
  return { characters: [...text].length, withoutSpaces: [...text.replace(/\s/gu, '')].length, words: words.length, lines: text ? text.split(/\r\n|\r|\n/).length : 0, bytes: new TextEncoder().encode(text).length, readingMinutes: words.length ? Math.ceil(words.length / 200) : 0 };
}
export function transformCase(text, mode) {
  if (mode === 'upper') return text.toLocaleUpperCase();
  if (mode === 'lower') return text.toLocaleLowerCase();
  if (mode === 'title') return text.toLocaleLowerCase().replace(/(^|\s)(\p{L})/gu, (_, a, b) => a + b.toLocaleUpperCase());
  const words = text.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/([a-z\d])([A-Z])/g, '$1 $2').match(/[\p{L}\p{N}]+/gu) ?? [];
  if (mode === 'slug') return words.map(w => w.toLowerCase()).join('-');
  if (mode === 'snake') return words.map(w => w.toLowerCase()).join('_');
  if (mode === 'camel') return words.map((w, i) => i ? w[0].toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase()).join('');
  throw new Error('Unknown text transformation.');
}
export function base64Encode(text) {
  const bytes = new TextEncoder().encode(text); let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
export function base64Decode(text) { return new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(text.trim()), c => c.charCodeAt(0))); }
export function decodeJWT(token) {
  const parts = token.trim().split('.');
  if (parts.length !== 3) throw new Error('Expected a JWT with three dot-separated segments.');
  const decode = s => JSON.parse(base64Decode(s.replaceAll('-', '+').replaceAll('_', '/')));
  return { header: decode(parts[0]), payload: decode(parts[1]), signatureVerified: false };
}
export function parseHex(hex) {
  let h = hex.trim().replace(/^#/, '');
  if (/^[a-f\d]{3}$/i.test(h)) h = [...h].map(c => c + c).join('');
  if (!/^[a-f\d]{6}$/i.test(h)) throw new Error('Enter a 3- or 6-digit hex color.');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}
export function luminance(hex) { return parseHex(hex).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [.2126, .7152, .0722][i], 0); }
export function contrastRatio(a, b) { const x = luminance(a), y = luminance(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
export function rgbToHSL(r, g, b) {
  [r, g, b] = [r, g, b].map(v => v / 255); const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2;
  let h = 0; if (d) h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [Math.round(h * 60), Math.round((d ? d / (1 - Math.abs(2 * l - 1)) : 0) * 100), Math.round(l * 100)];
}
export function diffLines(before, after) {
  const a = before.split('\n'), b = after.split('\n');
  if (a.length * b.length > 2_000_000) throw new Error('Comparison is limited to two million line pairs. Split large documents first.');
  const table = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) for (let j = b.length - 1; j >= 0; j--) table[i][j] = a[i] === b[j] ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
  const result = []; let i = 0, j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) { result.push({ type: 'same', text: a[i++] }); j++; }
    else if (j < b.length && (i === a.length || table[i][j + 1] > table[i + 1][j])) result.push({ type: 'add', text: b[j++] });
    else result.push({ type: 'remove', text: a[i++] });
  }
  return result;
}
export function parseQuery(input) {
  let query = input.trim();
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(query)) query = new URL(query).search;
  else if (query.includes('?')) query = query.slice(query.indexOf('?') + 1);
  query = query.replace(/^\?/, '').split('#')[0];
  return [...new URLSearchParams(query)];
}
export function convertTimestamp(input, unit = 'seconds') {
  if (!String(input).trim()) throw new Error('Enter a timestamp or date.');
  const date = /^[+-]?\d+(\.\d+)?$/.test(String(input).trim()) ? new Date(Number(input) * (unit === 'seconds' ? 1000 : 1)) : new Date(input);
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid date or timestamp.');
  return { iso: date.toISOString(), seconds: Math.floor(date.getTime() / 1000), milliseconds: date.getTime() };
}
export function calculateLoan(principal, annualRate, months) {
  if (![principal, annualRate, months].every(Number.isFinite) || principal <= 0 || annualRate < 0 || months <= 0 || !Number.isInteger(months) || months > 1200) throw new Error('Use a positive principal, nonnegative rate, and 1–1200 whole months.');
  const rate = annualRate / 1200, payment = rate ? principal * rate / (1 - (1 + rate) ** -months) : principal / months;
  if (!Number.isFinite(payment)) throw new Error('Values are too large to calculate.');
  let balance = principal; const schedule = [];
  for (let month = 1; month <= months; month++) { const interest = balance * rate, paid = month === months ? balance : Math.min(balance, payment - interest); balance = Math.max(0, balance - paid); schedule.push({ month, payment: paid + interest, principal: paid, interest, balance }); }
  const total = schedule.reduce((s, row) => s + row.payment, 0);
  return { payment, total, interest: total - principal, schedule };
}
export function resistorValue(bands) {
  const digits = { black: 0, brown: 1, red: 2, orange: 3, yellow: 4, green: 5, blue: 6, violet: 7, gray: 8, white: 9 };
  const multipliers = { ...Object.fromEntries(Object.entries(digits).map(([k, v]) => [k, 10 ** v])), gold: .1, silver: .01 };
  const tolerances = { brown: 1, red: 2, green: .5, blue: .25, violet: .1, gray: .05, gold: 5, silver: 10 };
  if (!(bands[0] in digits) || !(bands[1] in digits) || !(bands[2] in multipliers) || !(bands[3] in tolerances)) throw new Error('Invalid resistor bands.');
  const ohms = (digits[bands[0]] * 10 + digits[bands[1]]) * multipliers[bands[2]], tolerance = tolerances[bands[3]];
  return { ohms, tolerance, min: ohms * (1 - tolerance / 100), max: ohms * (1 + tolerance / 100) };
}
export function ohmsLaw(mode, a, b) {
  if (![a, b].every(Number.isFinite) || a <= 0 || b <= 0) throw new Error('Both inputs must be positive numbers.');
  let voltage, current, resistance;
  if (mode === 'vi') { voltage = a; current = b; resistance = a / b; }
  else if (mode === 'vr') { voltage = a; resistance = b; current = a / b; }
  else if (mode === 'ir') { current = a; resistance = b; voltage = a * b; }
  else throw new Error('Unknown input pair.');
  return { voltage, current, resistance, power: voltage * current };
}
export function escapeHTML(text) { return String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
export function renderMarkdown(text) {
  // Deliberately small dialect: raw HTML and images are never interpreted.
  let fenced = false;
  const inline = s => escapeHTML(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+)\*/g, '<em>$1</em>');
  const result = text.split('\n').map(line => {
    if (/^```/.test(line)) { fenced = !fenced; return fenced ? '<pre><code>' : '</code></pre>'; }
    if (fenced) return escapeHTML(line) + '\n';
    const heading = line.match(/^(#{1,6})\s+(.*)$/); if (heading) return `<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`;
    if (/^>\s?/.test(line)) return `<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`;
    if (/^[-*]\s/.test(line)) return `<div>• ${inline(line.slice(2))}</div>`;
    if (/^---+$/.test(line)) return '<hr>';
    return line ? `<p>${inline(line)}</p>` : '';
  }).join('\n');
  return result + (fenced ? '</code></pre>' : '');
}
export function generatePassword(length = 20, alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*') {
  if (!Number.isInteger(length) || length < 1 || length > 4096 || alphabet.length < 2 || alphabet.length > 256) throw new Error('Invalid password length or character set.');
  const limit = 256 - (256 % alphabet.length); let result = '';
  while (result.length < length) { const bytes = crypto.getRandomValues(new Uint8Array(Math.max(32, length - result.length))); for (const byte of bytes) if (byte < limit && result.length < length) result += alphabet[byte % alphabet.length]; }
  return result;
}
