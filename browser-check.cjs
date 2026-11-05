const { chromium } = require('C:/Users/Furries/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const path = require('node:path');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
(async () => {
  const extension = path.resolve(__dirname, '../slot-session-notes/extension');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'ssn-qa-'));
  const context = await chromium.launchPersistentContext(profile, {
    channel: 'msedge', headless: true,
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`]
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent('serviceworker', { timeout: 15000 });
    const id = new URL(worker.url()).host;
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => { errors.push(error.message); console.error('PAGE ERROR:', error.message); });
    await page.goto(`chrome-extension://${id}/index.html`);
    await page.locator('#save').waitFor({ state: 'visible' });
    await page.waitForFunction(() => !document.querySelector('#save').disabled);
    await page.locator('[name=site]').fill('Demo site (sample data)');
    await page.locator('[name=game]').fill('Demo game');
    await page.locator('[name=start]').fill('2026-11-04T12:00');
    await page.locator('[name=end]').fill('2026-11-04T12:30');
    await page.locator('[name=opening]').fill('100');
    await page.locator('[name=closing]').fill('80');
    await page.locator('[name=deposits]').fill('50');
    await page.locator('[name=withdrawals]').fill('10');
    await page.locator('[name=notes]').fill('Sample record — fictional values for the interface preview.');
    await page.locator('#save').click();
    await page.waitForFunction(() => document.querySelector('#count').textContent === '1');
    assert.equal(await page.locator('.result').textContent(), '-$60.00');
    assert.equal(await page.locator('#time').textContent(), '30 min');
    await page.reload();
    await page.waitForFunction(() => document.querySelector('#count').textContent === '1');
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.locator('[name=notes]').fill('<script>bad()</script>\nSample record — fictional values.');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.waitForFunction(() => document.querySelector('.note').textContent.startsWith('<script>'));
    assert.equal(await page.locator('#records script').count(), 0);
    await page.locator('#search').fill('nothing-matches-this');
    assert.equal(await page.locator('.record').count(), 0);
    assert.equal(await page.locator('#export').isDisabled(), true);
    await page.locator('#search').fill('Demo site');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#export').click();
    const download = await downloadPromise;
    const csv = fs.readFileSync(await download.path(), 'utf8');
    assert.ok(csv.includes('"-60.00"'));
    assert.ok(csv.includes('Demo site'));
    // Replace the test-injection string with an ordinary fictional note for the published screenshot.
    await page.getByRole('button', { name: 'Edit', exact: true }).click();
    await page.locator('[name=notes]').fill('Sample record — fictional values for this preview.');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await page.waitForFunction(() => document.querySelector('.note').textContent.startsWith('Sample record'));
    await page.locator('#search').fill('');
    await page.setViewportSize({ width: 1440, height: 1200 });
    await page.screenshot({ path: path.resolve(__dirname, '../slot-session-notes/docs/images/overview.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Mobile layout should not overflow');
    await page.screenshot({ path: path.resolve(__dirname, 'mobile-preview.png'), fullPage: true });
    // Draft survives a reload in the same tab.
    await page.locator('[name=site]').fill('Unsaved draft');
    await page.reload();
    await page.waitForFunction(() => document.querySelector('[name=site]').value === 'Unsaved draft');
    // A second extension tab sees changes, and concurrent writes are serialized.
    const second = await context.newPage();
    await second.goto(`chrome-extension://${id}/index.html`);
    await second.waitForFunction(() => document.querySelector('#count').textContent === '1');
    page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#count').textContent === '0');
    await second.waitForFunction(() => document.querySelector('#count').textContent === '0');
    assert.deepEqual(errors, []);
    console.log('PASS: actual unpacked extension loaded in Edge; create, calculation, persistence, edit, text safety, filter, CSV download, mobile width, draft reload, deletion, multi-tab sync; no page errors.');
  } finally { await context.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
