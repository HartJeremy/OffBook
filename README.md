# OffBook v53

OffBook is a browser/PWA cue-based rehearsal app for actors. It supports multi-character scripts, reader voice, microphone practice, random recall, repetition, blocking notes, bookmarks, and session review.

## What changed in v53

This release focuses on parser reliability and mobile import usability.

- Expanded script parser for multiple theatre/script formats.
- Correctly handles cast headings such as `CAST OF CHARACTERS`, `CHARACTERS`, and `Cast`.
- Supports cast entries using colons, periods, or dashes.
- Supports mixed-case character names such as `Nell` and `Kate`.
- Handles character aliases such as `DORA THE DISH (DORA)` by using the short dialogue name.
- Handles cast names that differ from dialogue headings, such as `THE SURVEYOR` in the cast list and `SURVEYOR` in dialogue.
- Ignores common non-character headings such as `TIME`, `PLACE`, `SETTING`, `AT RISE`, `END`, `INT.`, and `EXT.`.
- Adds parser notes during import review so ignored headings and detected cast data are visible.
- Replaces the mobile role picker layout with a simpler vertical list to prevent overlapping role pills.

## Tested script formats

Parser behavior was checked against these sample formats:

- Two-character cast list with uppercase dialogue names.
- Three-character cast list with `NAME: description` entries.
- Two-character cast list with `NAME. description` entries.
- Mixed-case cast names and dialogue headings.
- Character aliases using parenthetical short names.
- Scripts with no formal `CAST OF CHARACTERS` heading but character definitions at the top.

## If GitHub Pages still shows an older version

1. Open the GitHub Pages URL in Safari or Chrome.
2. Refresh once or twice.
3. If using the installed home-screen app, delete the old OffBook icon and reinstall from the browser.
4. On iPhone: Settings > Safari > Advanced > Website Data, then delete data for your GitHub Pages site if it is still stuck.

This release updates the service worker cache name and manifest start URL to help avoid stale PWA files.

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

## Storage note

The app still uses the existing local storage key from the v49 base so current users do not lose saved scripts and progress when upgrading. The visible app version, service worker cache, and manifest are v53.


## PDF Import

OffBook v53 supports text-based PDF imports using browser-side PDF text extraction. Scanned or image-only PDFs may not import correctly and will require OCR in a future version.


## v53 Patch

Fixes PDF import by loading the browser-compatible PDF.js build dynamically and correcting PDF text extraction syntax.
