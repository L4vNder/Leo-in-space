'use strict';

// Keep this in sync with package.json and the isolated authoring toolchain.
module.exports = {
  appId: 'com.astroctopi.app',
  productName: 'AstrOctopi',
  electronVersion: '45.3.2',
  directories: {output: 'release', buildResources: 'desktop/assets'},
  files: ['dist/**/*', 'desktop/*.cjs', 'desktop/assets/**/*', 'package.json', '!dist/downloads/**', '!dist/desktop.html', '!dist/desktop-download.js'],
  asar: true,
  npmRebuild: false,
  nodeGypRebuild: false,
  buildDependenciesFromSource: false,
  publish: null,
  win: {
    target: [{target: 'dir', arch: ['x64']}],
    icon: 'desktop/assets/icon.ico',
    executableName: 'AstrOctopi',
    requestedExecutionLevel: 'asInvoker',
    // No signing certificate is supplied. Keep resource editing enabled so the
    // application icon and product/version metadata are embedded in the EXE.
    signExecutable: false,
  },
};
