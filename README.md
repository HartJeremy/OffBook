# OffBook v45

**Rehearse lines. Learn cues. Get off book.**

OffBook is a browser/PWA rehearsal app for actors. It imports a plain-text script, finds every character, lets you practice one or more roles, and uses the other characters as cues.

## What changed in v45

- Renamed the app from Screenplay Line Trainer to **OffBook**.
- Updated the PWA manifest, browser title, install name, README, template file, and cache name.
- Added a new **OB** app icon in 192px and 512px sizes.
- Added local-storage migration from the v44 key so existing saved scripts can continue.

## Quick start

1. Open `index.html`, or host the folder and install it as a PWA.
2. Go to **Library**.
3. Load a `.txt` script, paste script text, or continue your last script.
4. Review the character list and line counts.
5. Select one or more roles to practice.
6. Pick cue mode, practice order, pool, and repetition.
7. Tap **Start rehearsal**.

## Recommended script format

```txt
TITLE: Script Name
AUTHOR: Author Name

ALICE
Where is Bob?

BOB
Right here.

CAROL
Can we get started?

ALICE
One second.
[pause:3]
Ready.
```

Rules:

- Character names go on their own line.
- Dialogue goes below the character name.
- Blank lines between speeches are recommended.
- Use `[pause:3]` for action beats.
- Parentheticals like `(quietly)` are ignored during speaking/checking.
- Scene headings and cast lists are optional, but the clean trainer format imports best.

## Multi-character rehearsal

You can practice one role or several roles at once.

Example:

- Practice roles: `ALICE`, `CAROL`
- Cue roles: every other character

OffBook tracks every line with a stable line ID so the navigator, random mode, reports, bookmarks, repetition, and status badges use the same source of truth.

## Cue modes

- **Last cue only**: shows/reads the single previous line.
- **Last 2 cues**: shows/reads the two previous lines.
- **Full lead-in since your last line**: shows all cue lines since your previous practice line.

## Practice modes

- **In order**: normal line order.
- **Random**: random pick from the current pool.
- **Random no repeats**: shuffles the current pool and works through it.

## Pools

- All selected-role lines
- Current range
- Needs work
- Failed
- Bookmarks

## Repetition

- **Repeat each line** repeats the same cue/line before moving on.
- **Repeat sequence** loops the selected pool multiple times.

## Review tab

Use Review for:

- Navigator
- Search
- Status filters
- Character stats
- Missed-line report
- Bookmarks

## PWA install notes

For install/offline use, host this folder over HTTPS or localhost. GitHub Pages works well.

Typical local test:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## GitHub Pages

After pushing to GitHub:

1. Go to repo **Settings**.
2. Open **Pages**.
3. Set source to `main` branch and `/root`.
4. Save.

## Commit message suggestion

```bash
git add .
git commit -m "Rebrand app as OffBook"
git push
```
