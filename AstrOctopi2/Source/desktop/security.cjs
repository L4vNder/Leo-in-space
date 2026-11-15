'use strict';
const path = require('node:path');
const SCHEME = 'astroctopi';
const APP_URL = `${SCHEME}://app/index.html`;
const MIME = Object.freeze({
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.png': 'image/png',
  '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
  '.zip': 'application/zip'
});
const EXTERNAL_HOSTS = new Set([
  'www.nasa.gov', 'humanresearchroadmap.nasa.gov',
  'www.csa-asc.gc.ca', 'humans-in-space.jaxa.jp'
]);
// Inspect the original path before WHATWG URL parsing can normalize dot segments.
function staticPath(raw, root) {
  if (typeof raw !== 'string' || raw.length > 4096 || /[\\\u0000-\u0020\u007f]/.test(raw)) return null;
  const match = /^astroctopi:\/\/app(\/[^?#]*)?(?:[?#].*)?$/.exec(raw);
  if (!match) return null;
  let url, decoded;
  try {url = new URL(raw); decoded = decodeURIComponent(match[1] || '/');} catch {return null;}
  if (url.protocol !== 'astroctopi:' || url.hostname !== 'app' || url.port || url.username || url.password || url.search || url.hash) return null;
  if (/[\\%\u0000-\u0020\u007f]/.test(decoded)) return null;
  if (/%(?:2f|5c)/i.test(match[1] || '')) return null;
  const parts = decoded.split('/').slice(1);
  if (decoded === '/') parts.splice(0, parts.length, 'index.html');
  if (!parts.length || parts.some(part => !/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(part) || part === '.' || part === '..')) return null;
  const extension = path.extname(parts.at(-1)).toLowerCase();
  if (!MIME[extension]) return null;
  const resolvedRoot = path.resolve(root);
  const file = path.resolve(resolvedRoot, ...parts);
  if (!file.startsWith(resolvedRoot + path.sep)) return null;
  return {file, type: MIME[extension]};
}
function allowedExternal(raw) {
  if (typeof raw !== 'string' || raw.length > 4096 || /[\\\u0000-\u0020\u007f]/.test(raw)) return false;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && EXTERNAL_HOSTS.has(url.hostname);
  } catch {return false;}
}
function allowedAppNavigation(raw) {
  try {
    const url = new URL(raw);
    return url.protocol === 'astroctopi:' && url.hostname === 'app' && !url.port && !url.username && !url.password && !url.search && ['/', '/index.html'].includes(url.pathname);
  } catch {return false;}
}
function allowedResource(raw) {
  if (typeof raw !== 'string') return false;
  if (raw.startsWith('blob:astroctopi://app/')) return true;
  if (raw.startsWith('data:')) return true;
  try {const url=new URL(raw); return url.protocol==='astroctopi:' && url.hostname==='app' && !url.port && !url.username && !url.password;} catch {return false;}
}
function allowedDownload(raw) {
  return typeof raw === 'string' && (raw.startsWith('blob:astroctopi://app/') || raw === 'astroctopi://app/astroctopi-source.zip');
}
module.exports = {SCHEME, APP_URL, MIME, staticPath, allowedExternal, allowedAppNavigation, allowedResource, allowedDownload};
