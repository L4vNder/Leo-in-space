# AstrOctopi

A cute, device-local astronaut wellbeing web app. Built with HTML, CSS, JavaScript modules, SVG, Web Crypto, and a service worker. The browser version needs no runtime packages, server account, or API key; the desktop installer includes its own Electron runtime.

## Windows laptop app

Version 1.1.0 adds a self-contained Windows x64 installer, desktop/Start menu shortcuts, offline fonts, and the butter-yellow octopus health icon. See [Windows installation instructions](desktop/INSTALL-WINDOWS.txt) and [desktop development/build documentation](desktop/README.md). The browser edition also includes a web app manifest and an Install app button when supported by the browser.

Website and desktop records are separate; transfer them using an encrypted mission backup and Restore backup. The installer bundles no crew records.

## Open

Use the published private Site, or serve the downloaded source with Python:

```sh
python3 -m http.server 5173 --directory dist --bind 127.0.0.1
```

Open http://localhost:5173 in a current browser. Use localhost or HTTPS: Web Crypto and service workers need a secure context. ES modules should be served rather than opening index.html directly.

Choose **Explore the demo mission**, select a crew member, and enter **123456**. The demo medical passphrase is **mission-control**. All demo crew, readings, and supplies are fictional. For a fresh mission with no readings or invented stock, choose **Set up my crew**. Export a backup before clearing an existing mission.

## What works

- Shared Netflix-style crew chooser; six-character minimum private crew passcodes; separate medical passphrase; five-minute idle lock.
- Seven logged vital measures: resting heart rate, SpO₂, systolic/diastolic blood pressure, temperature, respiratory rate, and conditional glucose.
- Color-coded contextual example ranges, gray missing/stale values, red dashboard warnings, method/time/context history, and JSON import.
- Authorized medical overview, private full-record review, and individual color-band configuration.
- Sleep diary and seven-day charts; paced breathing and NASA-linked sleep guidance.
- Food and fluid logging, editable plans, ration estimates, meal suggestions, restocking, and medical-console inventory totals.
- Exercise logs and plan tracking; private mood/stress notes; reaction-time practice.
- Optional reminder timers, local-device haptics and voice where the browser supports them. Unlocking arms that crew member’s enabled schedule for the open app session; reminders continue after the profile locks. Closing the app stops them.
- Guided crew activities; no private mood scores are exposed as a public tension signal.
- Original octopus SVG art: eight pastel colors, ten hats, ten accessories, and ten public profile-picture choices.
- Encrypted mission backup/restore and explicitly unencrypted personal-log export. Cached static app files support offline use after a successful initial load, where supported by the browser.

## Privacy and storage

Records stay in this browser's localStorage, encrypted with random per-profile AES-256-GCM data keys. Each data key is wrapped separately for the crew passcode and the medical passphrase using PBKDF2-SHA256 (250,000 iterations) and AES-GCM. Keys and decrypted logs remain in memory while unlocked. Public crew names, roles, and avatar choices are visible on the shared screen and in backups. Passphrases are not stored. Longer unique passphrases are stronger than short PINs.

The medical passphrase unlocks all records by design. Losing both access methods means records cannot be recovered. Clearing browser data removes the local mission. There is no automatic cloud sync. An encrypted mission backup is the recovery path. Local encryption is a prototype boundary, not a substitute for reviewed spacecraft access controls or protection against a compromised browser.

## Measurement and clinical limits

The in-app space health guide links NASA, CSA, and JAXA primary sources. Many sample analyses are performed on Earth, while some mission-specific onboard tests and many physiological/behavioral measurements can produce useful in-flight information. A normal wrist band cannot supply blood glucose.

All ranges and freshness windows are illustrative, not NASA astronaut alarm standards. Resting ranges require resting context; glucose example bands require fasting context. A gray card is unassessed, not healthy. Green means within the configured band, not proof of health. Flight surgeons must configure and validate personal baselines and mission procedures before operational use. Alerts do not contact Earth or diagnose or treat a condition. Reaction-time practice is not NASA's validated Cognition battery. Mood reports cannot establish crew conflict. Food-plan coverage is a log-completeness indicator, not a clinical nutrition score.

Device links, clinical validation, fleet-wide identity, actual spacecraft warehouse integration, durable medical infrastructure, and wrist-monitor/aircraft-announcement interfaces are not implemented. Import and manual entry work; sensor feeds are not simulated as live connections. Ration stock and water reserves are manually entered estimates.

## Verify

Node 22+ can run:

```sh
npm run check
npm test
```

The core suite covers encryption, credential rejection, profile isolation, medical permissions, session lock, backup recovery, tamper detection, empty fresh missions, source validation, and context/staleness/range behavior. UI flow checks used a simulated DOM; visual browser QA was unavailable in the authoring environment.
