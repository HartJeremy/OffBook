# OffBook v48

OffBook is a cue-based rehearsal app for actors. It supports multi-character scripts, reader voice, microphone practice, random recall, repetition, blocking notes, bookmarks, and session review.

## What changed in v48

- Fixed audio feedback controls so Test Ding and Test Err force a sound test.
- Added visible audio status: Audio Ready, Ding played, Err played, or blocked.
- Increased default feedback volume.
- Updated service worker registration and cache name to reduce stale GitHub Pages/PWA caching.
- Updated manifest start URL to `index.html?v=48`.

## If GitHub Pages still shows an older version

1. Open the GitHub Pages URL in Safari.
2. Refresh once or twice.
3. If using the installed home-screen app, delete the old OffBook icon and reinstall from Safari.
4. On iPhone: Settings > Safari > Advanced > Website Data, then delete data for your GitHub Pages site if it is still stuck.

## Audio feedback

Go to Rehearse > Rehearse settings > Audio feedback.

1. Tap Enable sound cues.
2. Confirm the status says Audio Ready.
3. Tap Test ding or Test err.
4. Make sure the phone is not muted and volume is up.

Browsers block generated audio until a user tap unlocks it, so the Enable button is required.

## Script format

```txt
TITLE: My Script
AUTHOR: Writer Name

JAY
I know it landed here somewhere.

REESE
Did you find it?

JAY
Not yet.
[pause:2]
Come help me look.
```

Optional tags after a line:

```txt
[block: Move DSR]
[note: Softer, not angry]
[prop: Golf wedge]
```
