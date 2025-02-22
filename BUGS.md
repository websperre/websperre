# Known bugs & quirks

- Exact matching fails if opening link from an external source, eg. `xdg-open <url>`
  - Occurs only when background script stops running after 30 seconds of inactivity.
  - Unfortunately browser.tabs.[] does not seem to be the fix.
- Sometimes a slight delay when loading a page.
  - Unable to reliably reproduce.
- Manifest v3: removed URL from block list still gets blocked from loading
  - Is fixed if/when another URL is added to the block list.
