'use strict';
/** Build unsigned Windows x64 desktop artifacts without Wine or admin access. */
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const {createRequire} = require('node:module');
const {spawn} = require('node:child_process');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '..');
const work = path.join(root, 'work', 'desktop-build');
const release = path.join(root, 'release');
process.env.ELECTRON_CACHE ||= path.join(root, 'work', 'electron-cache');
process.env.ELECTRON_BUILDER_CACHE ||= path.join(root, 'work', 'electron-builder-cache');
process.env.CSC_IDENTITY_AUTO_DISCOVERY = 'false';
if (process.env.HTTPS_PROXY || process.env.HTTP_PROXY) process.env.ELECTRON_GET_USE_PROXY ||= 'true';

function run(command, args, options={}) {
  return new Promise((resolve,reject)=>{
    const child=spawn(command,args,{cwd:root,env:process.env,stdio:'inherit',...options});
    child.once('error',reject);
    child.once('exit',code=>code===0?resolve():reject(new Error(`${path.basename(command)} exited with ${code}`)));
  });
}
function resolveTools(){
  const candidates=[createRequire(path.join(root,'package.json')),
    createRequire(path.join(root,'work','desktop-toolchain','package.json'))];
  for(const candidate of candidates)try{candidate.resolve('electron-builder');return candidate;}catch{}
  throw new Error('Install the pinned development dependencies with npm install before building.');
}
function nsisString(value){return value.replace(/\$/g,()=> '$$').replace(/"/g,()=> '$\\"');}
async function walk(dir,base=dir){
  const files=[],dirs=[];let size=0;
  for(const entry of await fsp.readdir(dir,{withFileTypes:true})){
    const absolute=path.join(dir,entry.name),relative=path.relative(base,absolute);
    if(entry.isDirectory()){const child=await walk(absolute,base);files.push(...child.files);dirs.push(relative,...child.dirs);size+=child.size;}
    else if(entry.isFile()){files.push(relative);size+=(await fsp.stat(absolute)).size;}
    else throw new Error(`Unexpected non-file in app package: ${relative}`);
  }
  return{files,dirs,size};
}
async function sha256(filename){return new Promise((resolve,reject)=>{const hash=createHash('sha256'),stream=fs.createReadStream(filename);stream.on('data',chunk=>hash.update(chunk));stream.on('error',reject);stream.on('end',()=>resolve(hash.digest('hex')));});}

(async()=>{
  await fsp.mkdir(work,{recursive:true});await fsp.mkdir(release,{recursive:true});
  const pkg=JSON.parse(await fsp.readFile(path.join(root,'package.json'),'utf8'));
  for(const filename of ['dist/index.html','desktop/main.cjs','desktop/assets/icon.ico','desktop/assets/icon.png'])if(!fs.existsSync(path.join(root,filename)))throw new Error(`Required build input is missing: ${filename}`);
  if(!/^\d+\.\d+\.\d+$/.test(pkg.version))throw new Error('Use a numeric major.minor.patch package version for this installer.');
  const tools=resolveTools();const {build,Platform,Arch}=tools('electron-builder');
  const config=require('./electron-builder.cjs');
  config.electronDownload={...(config.electronDownload||{}),cache:process.env.ELECTRON_CACHE};
  await build({projectDir:root,targets:Platform.WINDOWS.createTarget(['dir'],Arch.x64),config});
  const appDir=path.join(release,'win-unpacked');
  const listing=await walk(appDir);
  const uninstaller=path.join(work,'uninstall-files.nsh');
  const commands=[...listing.files.sort().map(file=>`Delete /REBOOTOK "$INSTDIR\\${nsisString(file.split(path.sep).join('\\'))}"`),...listing.dirs.sort((a,b)=>b.split(path.sep).length-a.split(path.sep).length).map(dir=>`RMDir "$INSTDIR\\${nsisString(dir.split(path.sep).join('\\'))}"`)];
  await fsp.writeFile(uninstaller,commands.join('\n')+'\n');
  const setupName=`AstrOctopi-Setup-${pkg.version}-Windows-x64.exe`;
  const zipName=`AstrOctopi-${pkg.version}-Windows-x64.zip`;
  const setup=path.join(release,setupName),portable=path.join(release,zipName);
  const {getMakeNsisPath}=tools('app-builder-lib/out/toolsets/windows');
  let nsis=await getMakeNsisPath('1.2.1'); // NSIS 3.12; verified upstream SHA256.
  if(process.platform==='win32' && /\.cmd$/i.test(nsis.path)){
    const bundle=path.dirname(nsis.path);
    nsis={path:path.join(bundle,'windows','makensis.exe'),env:{...nsis.env,NSISDIR:path.join(bundle,'windows')}};
  }
  await run(nsis.path,['-V2',`-DAPP_VERSION=${pkg.version}`,`-DAPP_VERSION_QUAD=${pkg.version}.0`,`-DAPP_DIR=${appDir}`,`-DAPP_ICON=${path.join(root,'desktop','assets','icon.ico')}`,`-DSETUP_OUT=${setup}`,`-DUNINSTALL_COMMANDS=${uninstaller}`,`-DPACKAGE_KB=${Math.ceil(listing.size/1024)}`,path.join(root,'desktop','installer.nsi')],{env:{...process.env,...nsis.env}});
  const sevenzip=await tools('app-builder-lib/out/toolsets/7zip').getPath7za();
  await fsp.rm(portable,{force:true});
  await run(sevenzip,['a','-tzip','-mx=7',portable,'*'],{cwd:appDir});
  const records=[{file:setupName,sha256:await sha256(setup)},{file:zipName,sha256:await sha256(portable)}];
  await fsp.writeFile(path.join(release,'SHA256SUMS.txt'),records.map(r=>`${r.sha256}  ${r.file}`).join('\n')+'\n');
  console.log(JSON.stringify({version:pkg.version,electron:config.electronVersion,platform:'Windows x64',signed:false,artifacts:records},null,2));
})().catch(error=>{console.error(error.message);process.exit(1);});
