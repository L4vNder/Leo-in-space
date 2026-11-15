# AstrOctopi

A cute, device-local astronaut wellbeing web app. Version 1.3.0 combines the AstrOctopi final interface with the original AstrOctopi light/dark palettes, plus Chrome-style color customization and page search. Built with HTML, CSS, JavaScript modules, SVG, Web Crypto, and a service worker. The browser version needs no runtime packages, server account, or API key; the desktop installer includes its own Electron runtime.

## Windows laptop app

Version 1.1.0 added a self-contained Windows x64 installer, desktop/Start menu shortcuts, offline fonts, and the butter-yellow octopus health icon. See [Windows installation instructions](desktop/INSTALL-WINDOWS.txt) and [desktop development/build documentation](desktop/README.md). The browser edition also includes a web app manifest and an Install app button when supported by the browser.

Website and desktop records are separate; transfer them using an encrypted mission backup and Restore backup. The installer bundles no crew records.

## Open

Use the published private Site, or serve the downloaded source with Python:

```sh
python3 -m http.server 5173 --directory dist --bind 127.0.0.1
```

Open http://localhost:5173 in a current browser. Use localhost or HTTPS: Web Crypto and service workers need a secure context. ES modules should be served rather than opening index.html directly.

Choose **Explore the demo mission**, select a crew member, and enter **123456**. The demo medical passphrase is **mission-control**. All demo crew, readings, and supplies are fictional. For a fresh mission with no readings or invented stock, choose **Set up my crew**. Export a backup before clearing an existing mission.

## New in the combined edition (1.2.0)

- The **AstrOctopi final** layout is unchanged in structure: crew chooser, sidebar, cards, medical features, encrypted mission data, and original octopus art remain intact.
- **Customize** (sparkles icon in the header) opens a right-side appearance drawer, inspired by Chrome's new-tab customization panel. Choose **Light**, **Dark**, or **Device**, and one of six coordinated palettes. **Original orbit** uses the older AstrOctopi app's original colors exactly for light and dark base colors.
- Tune four colors independently with color pickers: buttons/highlights, search bar, page background, and cards/panels. The live preview updates immediately. Custom choices are stored independently for light and dark, so switching modes does not erase either set. **Reset to original** restores both modes.
- A new **Search your space** bar (Ctrl+K / Cmd+K) helps navigate to app pages and the crew lounge. Search never indexes medical records or unlocks private areas. Search bar text is given an automatically chosen readable light/dark contrast color.
- All appearance settings are stored in localStorage outside the encrypted health data, and they persist across browser restarts. Personal health logs still use the original encryption and credentials.
- Original spoken **neutral reminders** are retained under *My preferences*, if speech synthesis is supported and the crew member opts in; this does not introduce audible private health data.

**Important:** This archive contains editable source and an offline-capable browser build. The previous 1.1.0 Windows installer is deliberately **not included**, since it would still install the old version. To make a new Windows installer, follow `desktop/README.md` and run `npm install` and `npm run desktop:build` on a supported build machine. The existing `desktop.html` is a project download/landing page, not a compiled updated installer.


## New in 1.3.0 — SOS rescue drill

- A prominent **SOS rescue signal** button appears on the crew homepage; a small SOS control remains in the top bar of other views. With no text field or other control focused, **Space** simulates a physical panic button. This shortcut does not steal Space from inputs, buttons, dialogs, or the Customize drawer.
- Activating SOS starts a **local repeating three-tone alarm** and a **red pulsing screen border** (reduced-motion accessibility respected). Select **Silence local alarm** to stop the sound and flashing while leaving the guide open, or **End drill** to return to the app. This alarm affects only the current device; it does not turn on spacecraft-wide lights or sounds. The app contains no hardware bridge.
- The central status panel first shows a simulated transmission, then either **Signal received** or **Signal lost**. Before the drill, choose which result to demonstrate using **Demo Earth link** on the homepage. These are **locally simulated outcomes**: no signal is sent to Earth, no acknowledgement is received, and no emergency service is contacted. The status panel opens rescue guidance automatically, or the operator can continue immediately. Both scenarios work offline.
- Seven rescue-guide categories: heart attack/cardiac arrest, decompression, burns, radiation, cabin fire, toxic atmosphere, and unresponsive crew member. Each includes the initial priority, numbered response cues, and a supporting reference. Guides are training summaries, **not validated operational spacecraft procedures or independent medical treatment instructions**; actual response requires the mission-approved checklist, onboard medical lead and flight surgeon.
- **Voice SOS** on the homepage and **Voice: choose an issue** within the rescue guide are opt-in browser Speech Recognition controls. Supported examples include “Mayday”, “heart attack”, “decompression”, “burn”, “radiation”, “fire”, “toxic air”, and “unresponsive”. In the guide, “back” and “silence alarm” also work. Voice recognition requires browser support and microphone permission, may be network-dependent / browser-service processed, and must **not** be relied on for real emergencies. Text/click/keyboard controls remain available. **Read guide aloud** uses the device speech-synthesis feature when supported.
- SOS does not access crew health records or mission passcodes, and it is available from the locked crew homepage. It is not an actual medical device, crew broadcast system, emergency communications system, or flight-certified fault monitor.

### Technical note for future hardware integration

The emergency interface lives in `dist/sos.js` and `dist/sos.css`. To turn the demo into an operational feature would require authenticated and redundant spacecraft communications, mission-approved alarm/siren interfaces, physical switch hardware, documented acknowledgement/retry semantics, human-factors review, and flight safety validation. No such integrations are included or implied.

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

All ranges and freshness windows are illustrative, not NASA astronaut alarm standards. Resting ranges require resting context; glucose example bands require fasting context. A gray card is unassessed, not healthy. Green means within the configured band, not proof of health. Flight surgeons must configure and validate personal baselines and mission procedures before operational use. Ordinary health alerts do not contact Earth or diagnose or treat a condition. The new SOS demonstration also does not contact Earth. Reaction-time practice is not NASA's validated Cognition battery. Mood reports cannot establish crew conflict. Food-plan coverage is a log-completeness indicator, not a clinical nutrition score.

Device links, clinical validation, fleet-wide identity, actual spacecraft warehouse integration, durable medical infrastructure, and wrist-monitor/aircraft-announcement interfaces are not implemented. Import and manual entry work; sensor feeds are not simulated as live connections. Ration stock and water reserves are manually entered estimates.

## Verify

Node 22+ can run:

```sh
npm run check
npm test
```

The core suite covers encryption, credential rejection, profile isolation, medical permissions, session lock, backup recovery, tamper detection, empty fresh missions, source validation, and context/staleness/range behavior. SOS keyboard, received/lost-signal, alarms, guide navigation, and homepage behavior were exercised in headless Chromium at desktop and mobile viewport sizes.
