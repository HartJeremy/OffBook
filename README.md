# Screenplay Line Trainer PWA

This package turns the screenplay line trainer into an installable PWA.

## Files

- `index.html` - the trainer app
- `manifest.json` - PWA install metadata
- `sw.js` - offline cache service worker
- `icons/` - install icons

## How to run locally

PWAs need `https://` or `localhost`. Opening `index.html` directly from Finder/File Explorer may run the app, but install/offline/mic behavior can be limited.

From this folder, run:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Install

- Chrome/Edge desktop: open the localhost or hosted URL, then use the install icon in the address bar.
- iPhone/iPad Safari: host it on HTTPS, open the URL, Share, then Add to Home Screen.

## Important browser notes

- Speech recognition works best in Chrome/Edge.
- iOS Safari may not support all Web Speech recognition features.
- Microphone permissions are controlled by the browser and are more stable on HTTPS or localhost.
