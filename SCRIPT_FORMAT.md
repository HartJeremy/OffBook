# Script Import Format

Use a plain text `.txt` file. The parser is designed for simple screenplay/play formatting.

## Basic format

```txt
TITLE: Example Play
AUTHOR: Your Name

EXT. PARK - DAY

A quiet park. Sam looks around.

SAM
I thought you said this place would be empty.

ALEX
It usually is.

SAM
Then why is there a marching band behind that tree?
```

## Required rule

Character names must be in **ALL CAPS** on their own line.

Correct:

```txt
JAY
I know it landed here somewhere.
```

Not ideal:

```txt
Jay: I know it landed here somewhere.
```

The app may handle some colon-style dialogue, but all-caps speaker blocks are safest.

## Dialogue lines

Dialogue should go directly under the character name.

```txt
REESE
Just take the drop. I won't even mark the stroke.
```

Multi-line dialogue is okay. The app will usually combine it into one rehearsal line.

```txt
REESE
You keep trying to hammer the ball
where you want it instead of guiding the club
where it needs to go.
```

## Parentheticals

Parentheticals are okay. They attach to the next spoken line.

```txt
REESE
(Shouting from offstage)
Did you find it?
```

## Stage directions and action

Stage directions are okay. They are useful for cue context but are not counted as actor rehearsal lines.

```txt
Jay searches in the grass.

JAY
Not yet, come help me look.
```

## Scene headings

Scene headings are okay.

```txt
EXT. BONNIE DUNS GOLF COURSE - EDGE OF FAIRWAY - DAY
```

They are not counted as rehearsal lines.

## Metadata

This is okay at the top of the file:

```txt
TITLE: In the Rough
AUTHOR: Tyler Romprey
TIME: Present day
PLACE: Bonnie Duns Golf Course
```

## What the app counts as a line

The app counts **spoken rehearsal lines only**.

These count:

```txt
JAY
I just can't lose something else.
```

These do not count:

```txt
Jay enters carrying a wedge.
EXT. GOLF COURSE - DAY
(Shouting from offstage)
```

## Best practices

- Save as `.txt`, not `.pdf` or `.docx`.
- Keep speaker names consistent, for example always `JAY`, not sometimes `JAY` and sometimes `JAY (O.S.)` unless intentional.
- Put one speaker's full thought under one character name.
- Use blank lines between dialogue blocks.
- Avoid decorative page headers/footers if copying from a PDF.

## Optional sections file

Sections can be made inside the app. If you want to import a section layout, use a tab-separated `.tsv` file like this:

```txt
Section	Start	End	Beat
Opening / Looking for the Ball	1	24	Golf setup, searching, banter, Reese starts pushing Jay to take the drop
Pressure Builds	25	48	Reese keeps poking, Jay resists, emotional stakes start leaking through
```

Use actor rehearsal line numbers, not raw PDF line numbers.
