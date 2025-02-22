# Known bugs & quirks

~1. Exact matching fails if opening link from an external source, eg. `xdg-open <url>`
    - Occurs only when background script stops running after 30 seconds of inactivity.
    - Unfortunately browser.tabs.[] does not seem to be the fix.~

2. Sometimes a slight delay when loading a page.
    - Unable to reliably reproduce.

~3. Manifest v3: removed URL from block list still gets blocked from loading
    - Is fixed if/when another URL is added to the block list.~

4. After removing everything from block list the very last item still gets blocked.
    - Gets resolved when a new item is added to the block list.
