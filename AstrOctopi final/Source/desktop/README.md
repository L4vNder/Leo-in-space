# AstrOctopi desktop

Self-contained Electron wrapper for the same encrypted, device-local AstrOctopi application. The app uses a stable, secure custom origin (`astroctopi://app`) so local storage and Web Crypto work without opening a network server. Renderer Node.js access is disabled; context isolation, the renderer sandbox, a content policy, and navigation/permission restrictions are enabled. No health data is embedded in distribution files.

## Develop and build

Install the pinned dependencies from the repository root:

```sh
npm install
npm run desktop:check
npm run desktop:dev
npm run desktop:build
```

The build script produces a Windows x64 per-user NSIS installer and a zipped unpacked application under `release/`. It downloads the pinned Electron and NSIS toolchain, verifies NSIS against the upstream checksum, and uses a custom installer that creates its uninstaller during installation on Windows. This allows building on Linux without running Windows executables or requiring Wine. Signing is disabled because no signing certificate is configured; production distribution should use the owner's code-signing identity.

The app icon is original generated artwork, converted to PNG and a multi-resolution Windows ICO. Fonts are bundled locally under their SIL Open Font licenses. The installer preserves the Electron user-data directory during uninstall.

Read `INSTALL-WINDOWS.txt` for installation and transferring an existing encrypted mission backup from the browser edition. Website and desktop data are separate stores.

## Web installer download

After the installer build finishes, `npm run desktop:download-assets` splits the setup file into 16 MiB static assets plus a size/hash manifest. The private Site download page verifies each part and the complete SHA-256 before creating the installer download. Generated binary chunks under `dist/downloads/` are build outputs and are excluded from Git, source ZIPs, and subsequent native app bundles. They must be included in the Site deployment artifact when offering the Windows download.
