const MAX_BYTES=512*1024*1024;
const MAX_CHUNK_BYTES=24*1024*1024;
const HASH=/^[a-f0-9]{64}$/i;
export function validateManifest(value){
  if(!value||typeof value!=='object'||!/^\d+\.\d+\.\d+$/.test(value.version)||typeof value.filename!=='string'||value.filename!==`AstrOctopi-Setup-${value.version}-Windows-x64.exe`||!Number.isSafeInteger(value.size)||value.size<1||value.size>MAX_BYTES||!HASH.test(value.sha256)||!Array.isArray(value.chunks)||value.chunks.length<1||value.chunks.length>32)throw new Error('The installer information is invalid. Please try again later.');
  const names=new Set();let total=0;
  const chunks=value.chunks.map(chunk=>{
    if(!chunk||typeof chunk.file!=='string'||!/^part-\d{3}\.bin$/.test(chunk.file)||names.has(chunk.file)||!Number.isSafeInteger(chunk.size)||chunk.size<1||chunk.size>MAX_CHUNK_BYTES||!HASH.test(chunk.sha256))throw new Error('The installer file list is invalid. Please try again later.');
    names.add(chunk.file);total+=chunk.size;
    return{file:chunk.file,size:chunk.size,sha256:chunk.sha256.toLowerCase()};
  });
  if(total!==value.size)throw new Error('The installer sizes do not match. Please try again later.');
  return{version:value.version,filename:value.filename,size:value.size,sha256:value.sha256.toLowerCase(),chunks};
}
export async function sha256(bytes){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');}
function canceled(signal){if(signal.aborted)throw new DOMException('Download canceled.','AbortError');}
async function readChunk(response,expected,signal,onProgress){
  if(!response.ok)throw new Error('An installer file could not be downloaded. Check your connection and try again.');
  const length=response.headers.get('Content-Length');
  if(length!==null&&Number(length)!==expected)throw new Error('An installer file has an unexpected size. Nothing was saved.');
  if(!response.body){const bytes=await response.arrayBuffer();canceled(signal);if(bytes.byteLength!==expected)throw new Error('The download was incomplete. Please try again.');onProgress(expected);return bytes;}
  const reader=response.body.getReader(),bytes=new Uint8Array(expected);let received=0;
  try{while(true){canceled(signal);const {done,value}=await reader.read();if(done)break;if(received+value.byteLength>expected)throw new Error('An installer file is larger than expected. Nothing was saved.');bytes.set(value,received);received+=value.byteLength;onProgress(received);}if(received!==expected)throw new Error('The download was incomplete. Please try again.');return bytes;}catch(error){await reader.cancel().catch(()=>{});throw error;}finally{reader.releaseLock();}
}
function initDownload(){
  const button=document.getElementById('download-button');if(!button)return;
  const cancel=document.getElementById('cancel-button'),status=document.getElementById('download-status'),progress=document.getElementById('download-progress'),errorBox=document.getElementById('download-error'),saveLink=document.getElementById('save-link'),checksum=document.getElementById('checksum');
  let controller=null,downloadUrl=null;
  const release=()=>{if(downloadUrl){URL.revokeObjectURL(downloadUrl);downloadUrl=null;}saveLink.hidden=true;saveLink.removeAttribute('download');saveLink.href='#';};
  cancel.addEventListener('click',()=>{controller?.abort();cancel.disabled=true;status.textContent='Canceling download…';});
  window.addEventListener('pagehide',()=>{controller?.abort();release();});
  button.addEventListener('click',async()=>{
    if(controller)return;release();errorBox.hidden=true;errorBox.textContent='';checksum.hidden=true;button.disabled=true;button.textContent='Preparing your download…';button.setAttribute('aria-busy','true');cancel.hidden=false;cancel.disabled=false;progress.hidden=false;progress.value=0;status.textContent='Checking installer information…';controller=new AbortController();const signal=controller.signal;
    try{
      if(!globalThis.crypto?.subtle)throw new Error('Secure verification needs a current browser and HTTPS. Open this page from the AstrOctopi website.');
      const manifestUrl=new URL('./downloads/windows/manifest.json',window.location.href);
      const response=await fetch(manifestUrl,{credentials:'same-origin',cache:'no-store',redirect:'error',signal});
      if(!response.ok)throw new Error('The Windows installer is not available yet. Please try again shortly.');
      const manifest=validateManifest(await response.json());canceled(signal);
      document.getElementById('version').textContent=`DESKTOP EDITION · ${manifest.version}`;
      button.textContent='Downloading installer…';let received=0,lastUpdate=0;const parts=[];
      for(const chunk of manifest.chunks){
        canceled(signal);const url=new URL(chunk.file,manifestUrl);
        const response=await fetch(url,{credentials:'same-origin',cache:'no-store',redirect:'error',signal});
        const bytes=await readChunk(response,chunk.size,signal,current=>{const time=performance.now();if(time-lastUpdate<200&&current<chunk.size)return;lastUpdate=time;const total=received+current;progress.value=total/manifest.size*94;status.textContent=`Downloading ${(total/1048576).toFixed(1)} of ${(manifest.size/1048576).toFixed(1)} MB…`;});
        canceled(signal);if(await sha256(bytes)!==chunk.sha256)throw new Error('A file did not pass its integrity check. Nothing was saved; please try again.');canceled(signal);parts.push(bytes);received+=chunk.size;
      }
      status.textContent='Verifying the complete installer…';button.textContent='Verifying download…';progress.value=97;
      const blob=new Blob(parts,{type:'application/vnd.microsoft.portable-executable'});parts.length=0;
      let complete=await blob.arrayBuffer();const completeHash=await sha256(complete);complete=null;canceled(signal);
      if(completeHash!==manifest.sha256)throw new Error('The complete installer did not pass its integrity check. Nothing was saved; please try again.');
      downloadUrl=URL.createObjectURL(blob);saveLink.href=downloadUrl;saveLink.download=manifest.filename;saveLink.hidden=false;saveLink.click();progress.value=100;status.textContent='Verified and ready. Open the saved installer to set up AstrOctopi.';checksum.textContent=`SHA-256 · ${manifest.sha256}`;checksum.hidden=false;button.textContent='Download Windows installer again ↓';
    }catch(error){
      if(error?.name==='AbortError'){status.textContent='Download canceled. You can start again whenever you’re ready.';}
      else{status.textContent='The download could not finish.';errorBox.textContent=error?.message||'Please check your connection and try again.';errorBox.hidden=false;}
      progress.hidden=true;button.textContent='Try downloading again ↓';
    }finally{controller=null;button.disabled=false;button.removeAttribute('aria-busy');cancel.hidden=true;cancel.disabled=false;}
  });
}
if(typeof document!=='undefined')initDownload();
