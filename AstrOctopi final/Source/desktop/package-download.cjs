'use strict';
// Prepare browser-download assets from the finished Windows installer.
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const version=require('../package.json').version;
const filename=`AstrOctopi-Setup-${version}-Windows-x64.exe`;
const input=path.join(root,'release',filename);
const directory=path.join(root,'dist','downloads','windows');
const chunkSize=16*1024*1024;
const digest=b=>createHash('sha256').update(b).digest('hex');
if(!fs.existsSync(input))throw new Error('Build the Windows installer before preparing its download.');
const source=fs.readFileSync(input);
if(source.length<1024*1024||source.toString('ascii',0,2)!=='MZ')throw new Error('A complete Windows installer is required.');
fs.mkdirSync(directory,{recursive:true});
for(const entry of fs.readdirSync(directory))if(/^part-\d{3}\.bin$/.test(entry)||entry==='manifest.json')fs.unlinkSync(path.join(directory,entry));
const chunks=[];
for(let start=0,index=1;start<source.length;start+=chunkSize,index++){
 const bytes=source.subarray(start,Math.min(start+chunkSize,source.length));
 const file=`part-${String(index).padStart(3,'0')}.bin`;
 fs.writeFileSync(path.join(directory,file),bytes);
 chunks.push({file,size:bytes.length,sha256:digest(bytes)});
}
const manifest={version,filename,size:source.length,sha256:digest(source),chunks};
fs.writeFileSync(path.join(directory,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.copyFileSync(path.join(root,'desktop','INSTALL-WINDOWS.txt'),path.join(directory,'INSTALL-WINDOWS.txt'));
fs.writeFileSync(path.join(directory,'SHA256SUMS.txt'),`${manifest.sha256}  ${filename}\n`);
const recomposed=Buffer.concat(chunks.map(c=>fs.readFileSync(path.join(directory,c.file))));
if(digest(recomposed)!==manifest.sha256)throw new Error('Chunk integrity verification failed.');
console.log(JSON.stringify({filename,size:manifest.size,sha256:manifest.sha256,chunks:chunks.length,verified:true},null,2));
