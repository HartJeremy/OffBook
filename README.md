# Line Rehearsal Trainer PWA v37

This package contains the installable/offline version of the screenplay line trainer.

## What's included

- `index.html` - the app
- `manifest.json` - PWA install metadata
- `service-worker.js` - offline caching
- `icons/` - app icons
- `SCRIPT_FORMAT.md` - how to make importable scripts
- `examples/sample_script.txt` - a tiny working import example

## How to run it locally

A PWA needs `localhost` or `https`. Opening `index.html` directly with `file://` may run the app, but install/offline features and mic behavior can be unreliable.

### Easiest local server

1. Unzip the package.
2. Open a terminal in the unzipped folder.
3. Run one of these:

```bash
python3 -m http.server 8080
```

or, on some Windows machines:

```bash
python -m http.server 8080
```

4. Open your browser to:

```txt
http://localhost:8080
```

5. In Chrome or Edge, use the install icon in the address bar or browser menu to install the app.

## How to import a script

1. Create a plain `.txt` file using the rules in `SCRIPT_FORMAT.md`.
2. Open the app.
3. Choose the `.txt` script file.
4. Click **Load selected file**.
5. Choose your role and rehearsal range.

## Data storage

The app stores practice memory, sections, and settings in your browser's local storage.

That means:

- It stays on the same browser/device.
- It does not sync across devices.
- Clearing browser data may erase saved progress.

## Recommended workflow

Keep a folder per show:

```txt
In the Rough/
  in_the_rough_script.txt
  in_the_rough_sections.tsv
  notes.md
```

For a new show, make a new script file, import it, then create sections inside the app.

## App icons

This package includes updated PNG app icons:

- `icons/icon-192.png` for standard PWA use
- `icons/icon-512.png` for install screens and high-resolution launchers
- `icons/icon-maskable-512.png` for maskable Android-style icons

If you replace icons later, keep the same filenames or update `manifest.json`.



## Package version

This package is v37. The app title, service-worker cache, manifest, and file names have been aligned to v37.


## iPhone icon note
If the Home Screen icon does not update, delete the old installed app, clear Safari website data for the app host, then reinstall. iOS caches PWA icons aggressively.
