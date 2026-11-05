export const CURRENCIES = ['USD', 'EUR', 'GBP', 'TRY'];

export function validateSession(input) {
  const text = (key, max, required = false) => {
    const value = String(input[key] ?? '').trim();
    if ((required && !value) || value.length > max) throw new Error(`Check ${key} (maximum ${max} characters).`);
    return value;
  };
  const money = key => {
    const raw = String(input[key] ?? '').trim();
    if (!/^\d+(\.\d{1,2})?$/.test(raw)) throw new Error('Enter non-negative amounts with at most two decimal places.');
    const cents = Math.round(Number(raw) * 100);
    if (!Number.isSafeInteger(cents) || cents > 100000000000) throw new Error('Amount is too large.');
    return cents;
  };
  const start = new Date(input.start).getTime();
  const end = new Date(input.end).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) throw new Error('End time must be on or after start time.');
  if (!CURRENCIES.includes(input.currency)) throw new Error('Choose a supported currency.');
  return {
    site: text('site', 120, true), game: text('game', 120),
    start: new Date(start).toISOString(), end: new Date(end).toISOString(),
    currency: input.currency, opening: money('opening'), closing: money('closing'),
    deposits: money('deposits'), withdrawals: money('withdrawals'), notes: text('notes', 3000)
  };
}

export const resultCents = s => s.closing + s.withdrawals - s.opening - s.deposits;
export const durationMinutes = s => Math.round((Date.parse(s.end) - Date.parse(s.start)) / 60000);
export const formatMoney = (cents, currency) => new Intl.NumberFormat('en', { style: 'currency', currency }).format(cents / 100);

export function totals(sessions) {
  return sessions.reduce((groups, s) => {
    groups[s.currency] = (groups[s.currency] || 0) + resultCents(s);
    return groups;
  }, {});
}

function csvCell(value) {
  let text = String(value ?? '');
  // Spreadsheet programs may execute cells beginning with a formula character.
  if (/^[\s\uFEFF]*[=+@-]/u.test(text) || /^[\t\r\n]/u.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function toCsv(sessions) {
  const header = ['site', 'game', 'start_utc', 'end_utc', 'duration_minutes', 'currency', 'opening_balance', 'closing_balance', 'deposits', 'withdrawals', 'net_result', 'notes'];
  const rows = sessions.map(s => [s.site, s.game, s.start, s.end, durationMinutes(s), s.currency,
    ...[s.opening, s.closing, s.deposits, s.withdrawals, resultCents(s)].map(n => (n / 100).toFixed(2)), s.notes]);
  // Numeric columns are generated from validated numbers; text columns are formula-escaped.
  return '\uFEFF' + [header.map(csvCell).join(','), ...rows.map(row => row.map((v, i) => i >= 6 && i <= 10 ? `"${v}"` : csvCell(v)).join(','))].join('\r\n');
}
