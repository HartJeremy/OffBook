# OffBook v47

Cue-based rehearsal and line memorization for actors.

## What changed in v47

- Restored audible result cues.
- Added **Enable sound cues**, **Test ding**, **Test err**, and volume control.
- Moved **Auto-advance after correct** out of Repetition and into Rehearse settings.
- Kept blocking, notes, props, Help, and multi-character rehearsal from v46.

## Quick start

1. Open OffBook.
2. Go to **Library**.
3. Load a `.txt` script or paste script text.
4. Select one or more roles to practice.
5. Choose cue mode and practice order.
6. Go to **Rehearse** and start.

## Audio feedback

Browsers block automatic sound until you tap something. In **Rehearse settings**:

1. Tap **Enable sound cues** once.
2. Use **Test ding** and **Test err** to confirm volume.
3. Keep **Ding pass / err fail** checked.

The ding plays after a passed check. The low err tone plays after a failed check. This works for manual checks and auto-check after speaking.

## Rehearse settings

These are general practice controls:

- Auto-advance after correct
- Auto-check after I stop speaking
- Keep listener open
- Clear wrong spoken attempts
- Cue mode quick override
- Audio feedback

## Repetition

These controls are only about drilling volume:

- Repeat each line
- Repeat sequence

## Script format

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
[note: Quiet, controlled]
[prop: keys in left hand]
Let us start.
```

## Tags

- `[pause:2]` adds a two-second pause.
- `[block: Move DSR]` adds blocking.
- `[note: softer]` adds an acting note.
- `[prop: golf wedge]` adds a prop reminder.

## PWA testing

For full install/offline behavior, serve the folder over localhost or HTTPS. Example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.
