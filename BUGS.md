# Known bugs & quirks

- Exact matching fails if opening link from an external source, eg. `xdg-open <url>`
  - Occurs only when background script stops running after 30 seconds of inactivity.
  - Unfortunately browser.tabs.[] does not seem to be the fix.
- Sometimes a slight delay when loading a page.
  - Unable to reliably reproduce.
