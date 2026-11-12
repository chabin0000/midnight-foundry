import test from 'node:test';
import assert from 'node:assert/strict';
import * as c from '../core.js';
test('JSON sorting preserves arrays and handles __proto__ as data', () => {
  assert.equal(c.stableJSON('{"z":[3,1],"a":{"b":2,"a":1}}', true), '{"a":{"a":1,"b":2},"z":[3,1]}');
  assert.equal(c.stableJSON('{"__proto__":1}', true), '{"__proto__":1}');
  assert.throws(() => c.stableJSON('{bad}'));
});
test('CSV quotes, CRLF, newline cells, empty cells and trailing delimiters', () => {
  assert.deepEqual(c.parseCSV('a,b\r\n"x,y","say ""hi"""\r\n"a\nb",'), [['a','b'],['x,y','say "hi"'],['a\nb','']]);
  assert.deepEqual(c.parseCSV('a,b\n'), [['a','b']]);
  assert.deepEqual(c.parseCSV('""'), [['']]);
  assert.throws(() => c.parseCSV('"open'));
  assert.throws(() => c.parseCSV('"a"oops'));
  assert.throws(() => c.csvToJSON('a,a\n1,2'));
  assert.throws(() => c.csvToJSON('a,b\n1'));
});
test('CSV round trip and prototype keys', () => {
  const rows = [['a','b'],['x,y','new\nline'],['"quote"','']];
  assert.deepEqual(c.parseCSV(c.toCSV(rows)), rows);
  assert.equal(Object.getPrototypeOf(c.csvToJSON('__proto__,b\nvalue,x')[0]), Object.prototype);
  assert.equal(c.csvToJSON('__proto__,b\nvalue,x')[0].__proto__, 'value');
});
test('Unicode encoding roundtrip and graphemes', () => {
  const s = '안녕 👩‍💻 café'; assert.equal(c.base64Decode(c.base64Encode(s)), s);
  assert.equal(c.textStats('👩‍💻').graphemes, 1); assert.equal(c.textStats('').lines, 0);
  assert.throws(() => c.base64Decode('/w=='));
});
test('case splitting handles acronyms', () => { assert.equal(c.cases('XMLHttpRequest').snake_case, 'xml_http_request'); assert.equal(c.cases('hello world').camelCase, 'helloWorld'); });
test('URL repeated parameters survive', () => assert.equal(c.inspectURL('https://example.com/?x=1&x=2').parameters.length, 2));
test('SHA-256 standard vector', async () => assert.equal(await c.sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'));
test('timestamp epoch, offsets, milliseconds and invalid input', () => {
  assert.equal(c.timestamp('0').utc, '1970-01-01T00:00:00.000Z');
  assert.equal(c.timestamp('2026-01-01T09:00:00+09:00').utc, '2026-01-01T00:00:00.000Z');
  assert.equal(c.timestamp('1767225600000').unixSeconds, 1767225600);
  assert.throws(() => c.timestamp('tomorrow')); assert.throws(() => c.timestamp('2026-01-01'));
});
test('colors and contrast endpoints', () => { assert.equal(c.colorInfo('#fff').contrastOnBlack, 21); assert.equal(c.colorInfo('#000').contrastOnWhite, 21); assert.equal(c.colorInfo('#f00').hsl, 'hsl(0 100% 50%)'); assert.throws(() => c.colorInfo('pink')); });
test('Markdown escaping and diff reconstruct both sides', () => {
  assert.match(c.markdownTable('a,b\nx|y,z'), /x\\\|y/);
  const a = 'a\nb\nc', b = 'a\nx\nc\nd', diff = c.diffLines(a,b).split('\n');
  assert.equal(diff.filter(l => !l.startsWith('+')).map(l => l.slice(2)).join('\n'), a);
  assert.equal(diff.filter(l => !l.startsWith('-')).map(l => l.slice(2)).join('\n'), b);
  assert.throws(() => c.diffLines('a\n'.repeat(1000), 'b\n'.repeat(1000)));
});
test('secure generator length, alphabet and range', () => { const p = c.securePassword(100,'ab'); assert.equal(p.length,100); assert.match(p,/^[ab]+$/); assert.throws(() => c.securePassword(7)); assert.throws(() => c.securePassword(8,'aa')); });
test('JWT decode explicitly signals lack of verification', () => { const jwt = c.base64Encode('{"alg":"none"}')+'.'+c.base64Encode('{"sub":"test"}')+'.'; assert.equal(c.decodeJWT(jwt).payload.sub, 'test'); assert.match(c.decodeJWT(jwt).signature, /NOT VERIFIED/); });
