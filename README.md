# OffBook v46

OffBook is a cue-based rehearsal app for actors. It helps you rehearse lines, learn cues, drill problem spots, and track what needs work.

## What's New in v46

- App name and PWA branding: **OffBook**
- Multi-character practice from v44
- Multiple practice roles
- Cue modes: last cue, last 2 cues, full lead-in
- Repeat each line and repeat sequence
- Random and random-no-repeat recall
- Bookmarks, status tracking, and missed-line reports
- Blocking, notes, and prop reminders attached to individual lines
- In-app Help tab

## Quick Start

1. Open OffBook.
2. Go to **Library**.
3. Load a `.txt` script or paste script text.
4. Review the import summary and character counts.
5. Select one or more roles to practice.
6. Choose cue mode, practice order, pool, and repetition settings.
7. Tap **Start rehearsal**.

## Recommended Script Format

```txt
TITLE: My Script
AUTHOR: Optional

ALICE
Where is Bob?

BOB
Right here.

ALICE
Good. [pause:2]
[block: Cross to DSR]
[note: quieter than before]
[prop: keys in left hand]
Let's start.
```

## Supported Line Tags

### Pause

```txt
[pause:2]
```

Adds a 2 second pause. OffBook does not read it aloud and does not require you to say it.

### Blocking

```txt
[block: Move DSR]
```

Adds blocking to the current line. Use this for movement, position, or physical action.

### Acting Notes

```txt
[note: Hold eye contact before speaking]
```

Adds an acting note to the current line.

### Props

```txt
[prop: Golf wedge in right hand]
```

Adds a prop reminder to the current line.

## Cue Modes

- **Last cue only:** shows the line immediately before yours.
- **Last 2 cues:** shows the two lines before yours.
- **Full lead-in:** shows all dialogue since your previous line.

## Practice Modes

- **In order:** best for learning a scene.
- **Random:** jumps around to test recall.
- **Random no repeats:** every line appears once before reshuffling.
- **Needs work:** drills lines you missed once.
- **Failed:** drills lines marked failed.
- **Bookmarks:** drills lines you bookmarked.

## Repetition

- **Repeat each line:** do the same line multiple times before moving on.
- **Repeat sequence:** loop the selected pool multiple times.

## Help

The app now includes a **Help** tab with the script format, cue mode explanations, practice mode definitions, and line-tag examples.

## Install as PWA

Host the folder on HTTPS or use a local server for testing:

```bash
python3 -m http.server 8080
```

Then open the local address in Chrome/Edge/Safari and choose install/add to home screen.
