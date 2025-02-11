# Websperre

**Websperre** is a website blocker. The intent is to stop specific websites from loading to help manage temptations of wanting to spend time on said websites.

Websperre differs from other "be focused by blocking this site" extensions by setting the unlock key by itself (i.e. the user does not decide what the password will be) and blocked websites only become accessible again if the user removes it from the block list.

## Features

- Regex match the entire domain, i.e. block an entire website.
- Exactly match the current tab's URL, i.e. block a specific part of a website.
- Custom user edit, i.e. anything the user puts in gets blocked.

## Screenshots

- [The extension](screenshots/extension.png)
- [Blocked request page](screenshots/blocked-request-page.png)
- [Blocked request page during key input](screenshots/blocked-request-page-guessing.png)
- [Blocked request page when making guessing easier](screenshots/make-guessing-easier.png)

## How it works

1. On first open, 5 separate unlock keys are generated which are hashed using the salt generated prior-to.

    a. Each key is a randomly generated number that range from 1-100k (1st), 1-10k (2nd) all the way down to 1-10 (5th).

    b. Any of the 5 keys can be used to unlock and remove one (1) entry from the block list at a time.

2. The webRequest API is used to stop user added websites from loading by redirecting the user to a blocked request page. User can then either:

    a. Close the tab or;

    b. Guess the key to see the block list so they can remove an entry.

Guessing is intentionally made difficult because of the number range (1.a.) of keys.

Users *can* choose to make guessing easier. But the user will have to wait 2 minutes (1st -> 2nd key), then 3 minutes (2nd -> 3rd key) and so on until they can start to guess the key inside the particular range. Failed guess interval in-between one key remains static.

The expectation is: during the time of an user attempting to guess, the user can realize why they'd blocked the website in the first place and will move on.

## What Websperre is not

Websperre is ***not*** an ad-blocker, content blocker, tracker blocker, etc.
