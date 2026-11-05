import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSession, resultCents, durationMinutes, totals, toCsv } from '../extension/model.js';
const input = { site: 'Example', game: 'Demo', start: '2026-11-04T10:00:00Z', end: '2026-11-04T11:30:00Z', currency: 'USD', opening: '100.10', closing: '80.20', deposits: '50', withdrawals: '10', notes: '' };
test('cash flows and decimal balances use integer cents', () => {
  const s = validateSession(input);
  assert.equal(resultCents(s), -5990);
  assert.equal(durationMinutes(s), 90);
});
test('totals never combine currencies', () => {
  const usd = validateSession(input);
  const eur = validateSession({ ...input, currency: 'EUR' });
  assert.deepEqual(totals([usd, eur, usd]), { USD: -11980, EUR: -5990 });
});
test('invalid amounts, currencies, chronology, empty sites are rejected', () => {
  for (const delta of [{ opening: '' }, { opening: '-1' }, { closing: '0.001' }, { deposits: 'Infinity' }, { currency: 'XXX' }, { site: ' ' }, { end: '2026-11-03T11:30:00Z' }, { start: 'invalid' }]) {
    assert.throws(() => validateSession({ ...input, ...delta }));
  }
});
test('CSV preserves quotes, multiline notes and neutralizes text formulas', () => {
  const s = validateSession({ ...input, site: '=HYPERLINK("bad")', notes: 'line 1, "quoted"\nline 2' });
  const csv = toCsv([s]);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('"\'=HYPERLINK(""bad"")"'));
  assert.ok(csv.includes('"line 1, ""quoted""\nline 2"'));
  assert.ok(csv.includes('"-59.90"'));
});
