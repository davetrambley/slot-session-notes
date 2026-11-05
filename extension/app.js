import { validateSession, resultCents, durationMinutes, formatMoney, totals, toCsv } from './model.js';

const $ = selector => document.querySelector(selector);
const form = $('#session-form');
let sessions = [];
let editing = null;
let saving = false;
let loaded = false;
const KEY = 'ssn_sessions_v1';
const localDate = date => {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
};
const say = (message, error = false) => {
  $('#status').textContent = message;
  $('#status').classList.toggle('error', error);
};
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
};
function reset() {
  form.reset();
  editing = null;
  form.elements.start.value = localDate(new Date());
  form.elements.end.value = localDate(new Date());
  $('#form-title').textContent = 'Log a session';
  $('#save').textContent = 'Save session';
  sessionStorage.removeItem('ssn_draft');
}
function filtered() {
  const query = $('#search').value.trim().toLowerCase();
  return sessions.filter(s => `${s.site} ${s.game} ${s.notes}`.toLowerCase().includes(query));
}
function render() {
  $('#count').textContent = String(sessions.length);
  $('#time').textContent = `${sessions.reduce((n, s) => n + durationMinutes(s), 0)} min`;
  $('#net').textContent = Object.entries(totals(sessions)).map(([c, n]) => formatMoney(n, c)).join('\n') || 'No records yet';
  const visible = filtered();
  $('#shown').textContent = `${visible.length} of ${sessions.length} sessions · CSV exports the current filter`;
  $('#export').disabled = !visible.length;
  $('#records').replaceChildren();
  if (!visible.length) {
    const empty = element('div', 'empty', '');
    empty.append(element('strong', '', sessions.length ? 'No matching sessions' : 'Your first entry starts here'), document.createTextNode(sessions.length ? 'Try another search.' : 'Add a session to see your history and totals.'));
    $('#records').append(empty);
  }
  visible.forEach(s => {
    const card = element('article', 'record', '');
    const top = element('div', 'record-top', '');
    const title = element('div', '', '');
    title.append(element('h3', '', s.site), element('p', 'game', s.game || 'No game specified'));
    const result = resultCents(s);
    top.append(title, element('span', `result ${result > 0 ? 'positive' : result < 0 ? 'negative' : ''}`, formatMoney(result, s.currency)));
    const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });
    card.append(top, element('p', 'meta', `${date.format(new Date(s.start))} → ${date.format(new Date(s.end))} · ${durationMinutes(s)} min\nOpening ${formatMoney(s.opening, s.currency)} · Closing ${formatMoney(s.closing, s.currency)} · Deposits ${formatMoney(s.deposits, s.currency)} · Withdrawals ${formatMoney(s.withdrawals, s.currency)}`));
    if (s.notes) card.append(element('p', 'note', s.notes));
    const actions = element('div', 'record-actions', '');
    const edit = element('button', '', 'Edit');
    edit.type = 'button';
    edit.addEventListener('click', () => {
      editing = s.id;
      for (const key of ['site', 'game', 'currency', 'notes']) form.elements[key].value = s[key];
      for (const key of ['opening', 'closing', 'deposits', 'withdrawals']) form.elements[key].value = (s[key] / 100).toFixed(2);
      for (const key of ['start', 'end']) form.elements[key].value = localDate(new Date(s[key]));
      $('#form-title').textContent = 'Edit session';
      $('#save').textContent = 'Save changes';
      keepDraft();
      form.elements.site.focus();
    });
    const remove = element('button', 'delete', 'Delete');
    remove.type = 'button';
    remove.addEventListener('click', async () => {
      if (!confirm(`Delete the session for ${s.site}? This cannot be undone.`)) return;
      remove.disabled = true;
      try {
        await mutate(current => current.filter(item => item.id !== s.id));
        if (editing === s.id) reset();
        say('Session deleted.');
      } catch (error) { say(`Could not delete: ${error.message}`, true); }
      finally { remove.disabled = false; }
    });
    actions.append(edit, remove);
    card.append(actions);
    $('#records').append(card);
  });
}

async function mutate(transform) {
  // Serialize read-modify-write operations across extension tabs.
  return navigator.locks.request(KEY, async () => {
    const stored = await chrome.storage.local.get(KEY);
    const next = transform(stored[KEY] || []);
    await chrome.storage.local.set({ [KEY]: next });
    sessions = next.sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
    render();
  });
}
function keepDraft() {
  try { sessionStorage.setItem('ssn_draft', JSON.stringify({ fields: Object.fromEntries(new FormData(form)), editing })); }
  catch { /* Saved sessions still use chrome.storage; draft persistence is best effort. */ }
}
form.addEventListener('input', keepDraft);
form.addEventListener('change', keepDraft);
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (saving || !loaded) return;
  try {
    const entry = validateSession(Object.fromEntries(new FormData(form)));
    const editId = editing;
    saving = true;
    $('#save').disabled = true;
    await mutate(current => {
      if (editId && !current.some(s => s.id === editId)) throw new Error('This record was deleted in another tab. Clear the form to create a new record.');
      const record = { ...entry, id: editId || crypto.randomUUID() };
      return editId ? current.map(s => s.id === editId ? record : s) : [...current, record];
    });
    reset();
    say('Session saved on this device.');
  } catch (error) { say(`Could not save: ${error.message}`, true); }
  finally { saving = false; $('#save').disabled = !loaded; }
});
$('#clear-form').addEventListener('click', () => {
  if (confirm('Clear this form? Saved sessions will stay in your history.')) reset();
});
$('#search').addEventListener('input', render);
$('#export').addEventListener('click', () => {
  const url = URL.createObjectURL(new Blob([toCsv(filtered())], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `slot-session-notes-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  say('CSV export requested. Check your browser downloads.');
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes[KEY]) {
    sessions = (changes[KEY].newValue || []).sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
    render();
  }
});
async function init() {
  $('#save').disabled = true;
  reset();
  try {
    const stored = await chrome.storage.local.get(KEY);
    sessions = (stored[KEY] || []).sort((a, b) => Date.parse(b.start) - Date.parse(a.start));
    loaded = true;
    $('#save').disabled = false;
  } catch (error) { say(`Could not load saved records: ${error.message}. Reopen the extension.`, true); }
  render();
}
// Preserve this tab's form across reloads without syncing it to any server.
const draft = sessionStorage.getItem('ssn_draft');
await init();
if (draft) {
  try {
    const saved = JSON.parse(draft);
    for (const [key, value] of Object.entries(saved.fields)) if (form.elements[key]) form.elements[key].value = value;
    editing = saved.editing;
    if (editing) { $('#form-title').textContent = 'Edit session'; $('#save').textContent = 'Save changes'; }
    keepDraft();
  } catch { sessionStorage.removeItem('ssn_draft'); }
}
