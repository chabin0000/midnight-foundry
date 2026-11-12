import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatJSON, parseCSV, stringifyCSV, csvToJSON, jsonToCSV, textStats,
  base64Encode, base64Decode, parseHex, contrastRatio, diffLines,
  parseQuery, convertTimestamp, calculateLoan, resistorValue, ohmsLaw,
  escapeHTML, renderMarkdown
} from '../lib/core.mjs';

test('JSON formatting parses and pretty prints', () => {
  assert.equal(formatJSON('{"a":1}'), '{\n  "a": 1\n}');
  assert.throws(() => formatJSON('{'), SyntaxError);
});
test('CSV handles quotes, escaped quotes, BOM and line endings', () => {
  assert.deepEqual(parseCSV('\uFEFFname,note\r\nAda,"hi, ""there"""\r\n'), [['name','note'],['Ada','hi, "there"']]);
  assert.deepEqual(csvToJSON('name,note\nAda,"hello, world"'), [{name:'Ada',note:'hello, world'}]);
  assert.equal(stringifyCSV([['a','b'],['x,y','say "yes"']]), 'a,b\r\n"x,y","say ""yes"""');
  assert.throws(() => parseCSV('a,"broken'), /Unclosed/);
  assert.throws(() => csvToJSON('a,a\n1,2'), /unique/);
});
test('CSV and JSON round trip Unicode records', () => {
  const rows = [{name:'민지', note:'안녕, 🌱'}, {name:'Kai', note:'line\nbreak'}];
  assert.deepEqual(csvToJSON(jsonToCSV(rows)), rows);
});
test('text stats count Unicode characters and UTF-8 bytes', () => {
  assert.deepEqual(textStats('한글 🌱\nnext'), {characters:9,withoutSpaces:7,words:3,lines:2,bytes:16,readingMinutes:1});
});
test('Base64 round trips Korean and emoji', () => {
  const encoded = base64Encode('안녕 🌌');
  assert.equal(base64Decode(encoded), '안녕 🌌');
  assert.throws(() => base64Decode('%%%'));
});
test('color helpers validate hex and calculate WCAG contrast', () => {
  assert.deepEqual(parseHex('#abc'), [170,187,204]);
  assert.ok(Math.abs(contrastRatio('#000','#fff') - 21) < 1e-12);
  assert.throws(() => parseHex('#12'));
});
test('line diff identifies additions and removals', () => {
  assert.deepEqual(diffLines('a\nb\nc','a\nx\nc'), [{type:'same',text:'a'},{type:'remove',text:'b'},{type:'add',text:'x'},{type:'same',text:'c'}]);
});
test('query parser supports full URLs and repeated values', () => {
  assert.deepEqual(parseQuery('https://example.test/?x=1&x=2#top'), [['x','1'],['x','2']]);
  assert.deepEqual(parseQuery('path?hello=world'), [['hello','world']]);
});
test('timestamp conversion handles seconds and invalid dates', () => {
  assert.equal(convertTimestamp('0').iso, '1970-01-01T00:00:00.000Z');
  assert.throws(() => convertTimestamp('not a date'), /Invalid/);
});
test('loan schedule totals match principal and interest', () => {
  const loan = calculateLoan(1200, 0, 12);
  assert.equal(loan.payment, 100);
  assert.equal(loan.total, 1200);
  assert.equal(loan.schedule.at(-1).balance, 0);
  assert.throws(() => calculateLoan(-1, 3, 12));
});
test('resistor bands and Ohm law calculations', () => {
  assert.deepEqual(resistorValue(['red','violet','brown','gold']), {ohms:270,tolerance:5,min:256.5,max:283.5});
  assert.equal(ohmsLaw('vi', 12, 2).resistance, 6);
});
test('markdown output escapes raw HTML', () => {
  assert.equal(escapeHTML('<script>'), '&lt;script&gt;');
  assert.match(renderMarkdown('<img src=x>'), /&lt;img/);
  assert.match(renderMarkdown('**safe**'), /<strong>safe<\/strong>/);
});

