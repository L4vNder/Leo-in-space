'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {APP_URL,staticPath,allowedExternal,allowedAppNavigation,allowedResource,allowedDownload}=require('../desktop/security.cjs');
const root=path.resolve('/test/astroctopi/dist');
test('packaged application assets resolve under the immutable content root',()=>{
  assert.equal(staticPath(APP_URL,root).file,path.join(root,'index.html'));
  assert.equal(staticPath('astroctopi://app/',root).type,'text/html; charset=utf-8');
  assert.equal(staticPath('astroctopi://app/fonts/outfit.woff2',root).file,path.join(root,'fonts','outfit.woff2'));
  assert.equal(staticPath('astroctopi://app/app.js',root).type,'text/javascript; charset=utf-8');
  assert.equal(staticPath('astroctopi://app/fonts/outfit.ttf',root).type,'font/ttf');
});
test('encoded traversal, alternate hosts, arbitrary files, and nested encodings are rejected',()=>{
  for(const url of [
    'file:///etc/passwd','https://app/app.js','astroctopi://evil/app.js',
    'astroctopi://app/../main.cjs','astroctopi://app/%2e%2e/main.js',
    'astroctopi://app/fonts/../../core.js','astroctopi://app/%252e%252e/core.js',
    'astroctopi://app/%2fetc/passwd.js','astroctopi://app/fonts%5c..%5capp.js',
    'astroctopi://app/.git/config.json','astroctopi://app/C:/secret.json',
    'astroctopi://app/app.js?secret=1','astroctopi://app/app.js#fragment',
    'astroctopi://app:80/app.js','astroctopi://user@app/app.js',
    'astroctopi://app/app.cjs','astroctopi://app/a%00.js','astroctopi://app/a%20.js',
    'astroctopi://app/fonts//outfit.woff2','astroctopi://app/%ZZ.js'
  ])assert.equal(staticPath(url,root),null,url);
});
test('only named primary reference sites can open outside the app',()=>{
  for(const url of ['https://www.nasa.gov/hrp/','https://humanresearchroadmap.nasa.gov/tasks/task.aspx?i=1234','https://www.csa-asc.gc.ca/eng/sciences/bio-monitor.asp','https://humans-in-space.jaxa.jp/en/biz-lab/med-in-space/healthcare/medops/system/'])assert.equal(allowedExternal(url),true,url);
  for(const url of ['https://www.nasa.gov.evil.test/','https://www.nasa.gov@evil.test/','https://evil.test@www.nasa.gov/','https://www.nasa.gov:8443/','http://www.nasa.gov/','file:///C:/Windows/system32/calc.exe','javascript:alert(1)','mailto:a@example.com','https://evil.test/'])assert.equal(allowedExternal(url),false,url);
});
test('renderer navigation remains on the application document',()=>{
  assert.equal(allowedAppNavigation(APP_URL),true);
  assert.equal(allowedAppNavigation('astroctopi://app/index.html#top'),true);
  for(const url of ['astroctopi://app/app.js','astroctopi://app/index.html?remote=1','https://www.nasa.gov/','file:///etc/passwd'])assert.equal(allowedAppNavigation(url),false,url);
});
test('renderer network requests cannot reach remote services or local files',()=>{
  for(const url of [APP_URL,'astroctopi://app/fonts/outfit.woff2','blob:astroctopi://app/12345','data:image/png;base64,abcd'])assert.equal(allowedResource(url),true,url);
  for(const url of ['https://www.nasa.gov/','http://localhost:5173/','file:///C:/secret.json','ws://127.0.0.1:1234/','blob:https://example.com/123','astroctopi://evil/app.js'])assert.equal(allowedResource(url),false,url);
});

test('downloads are confined to generated local logs and the bundled source archive',()=>{
  assert.equal(allowedDownload('blob:astroctopi://app/12345'),true);
  assert.equal(allowedDownload('astroctopi://app/astroctopi-source.zip'),true);
  for(const url of ['https://www.nasa.gov/file.zip','blob:https://evil.test/12345','astroctopi://app/app.js','astroctopi://evil/astroctopi-source.zip','astroctopi://app/astroctopi-source.zip?remote=1','file:///etc/passwd'])assert.equal(allowedDownload(url),false,url);
});
