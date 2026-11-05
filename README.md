# Slot Session Notes

A small, local-first browser extension for recording slot sessions, balances, and notes. Built by [DaveTheSlot](https://davetheslot.com/).

**Version 0.1.0 · Early local release · Manual entry only**

![Slot Session Notes interface](docs/upload-privacy-review.png)

## What it does

- Records site, game, start/end times, currency, balances, and notes.
- Accounts for deposits and withdrawals during a session.
- Shows recorded time and separate net totals for each currency.
- Lets you edit, delete, and search records.
- Exports all records, or the current search results, to CSV.
- Keeps records in this browser profile using `chrome.storage.local`.

Net result = closing balance + withdrawals − opening balance − deposits.
Enter balances for the same account and currency. This is an account-balance journal: it cannot isolate one game's result when the same account has other activity during the recorded period. It does not infer results or predict outcomes.

## Install locally

1. Download this repository with **Code → Download ZIP** and extract it.
2. In Chrome, open `chrome://extensions`.
3. Turn on **Developer mode**.
4. Select **Load unpacked** and choose the **extension** folder (the folder containing `manifest.json`).
5. Pin **Slot Session Notes** from the extensions menu and click its icon.

The journal opens in a full tab. No build step, account, API key, or npm installation is required to use it. Keep the extracted folder in place while using the extension.

This is an unpacked extension, not a Chrome Web Store listing. The initial target is Chromium-based desktop browsers. An automated unpacked-extension smoke test passed in Microsoft Edge; a manual Chrome check is still recommended before wider distribution. In Edge, use `edge://extensions` and the equivalent **Load unpacked** flow.

## First session

Enter a site name, optional game name, start/end times, currency, and balances. Deposits and withdrawals default to zero. Click **Save session**. Dates are entered/displayed in your computer's local timezone; CSV timestamps use UTC. Closing a tab keeps saved records. An unfinished form is retained on reload within that tab, but not after closing the tab.

**Export CSV** downloads the currently visible records. Clear the search first to export everything. CSV is for spreadsheets and archiving; this version cannot import it back into the extension. Keep exports private: they contain your notes and balances.

## Site compatibility

Site names are entered manually. This version does not read pages, detect games, import site records, or integrate with operators. Manual entry does not establish a tested integration with a site.

There are **no verified site integrations yet**. See the [compatibility register](docs/site-compatibility.md) for the criteria and the process for adding one.

## Privacy and permissions

Only the `storage` permission is requested. There are no host permissions, content scripts, analytics, ads, remote scripts, or network requests in the extension. No browsing history, passwords, or account data are read. The icon opens the journal in a tab.

Records remain in the current browser profile. They are not encrypted by this extension and are not synced by it. Removing the extension or clearing its data can delete the records. Export before doing so. See [PRIVACY.md](PRIVACY.md).

## Contributing

Bug reports, accessibility improvements, and tested integrations are welcome. Please include reproduction steps and browser version, and use fictional records in screenshots. See [CONTRIBUTING.md](CONTRIBUTING.md) and the [roadmap](ROADMAP.md).

Developers can run the calculation and CSV checks with Node.js 20+:

```sh
npm test
```

## Project and maintainer

Slot Session Notes is a DaveTheSlot project. Visit the maintainer's website: [DaveTheSlot.com](https://davetheslot.com/).

The maintainer website is separate from the extension. Using the journal does not send records to it. Any future paid project sponsorships will be identified separately from technical compatibility.

## License

[MIT](LICENSE) · DaveTheSlot
