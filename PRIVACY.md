# Privacy

Slot Session Notes 0.1.0 stores the information you type into the journal in `chrome.storage.local`, within the browser profile where it is installed. This includes site/game names, dates, currency, balances, deposits, withdrawals, and notes. Form drafts use tab-scoped `sessionStorage`.

The extension has no server, accounts, telemetry, advertising, external dependencies, or automatic network requests. It does not inspect websites, cookies, passwords, or browsing history. It requests only the `storage` permission. Saved records are not encrypted by the extension or automatically synced by it.

CSV exports are saved by the browser to your chosen download location. Exported files contain personal records and are outside the extension's control. Deleting a session removes it from the journal but does not remove earlier exports or copies. Removing the extension or clearing extension data can erase saved records. CSV re-import is not available in this version.

The repository hosting service and your browser have their own privacy practices. Do not post real personal records in public issues.
