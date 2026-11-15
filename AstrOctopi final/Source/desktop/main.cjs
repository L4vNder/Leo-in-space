'use strict';
const {app, BrowserWindow, Menu, protocol, session, shell, dialog} = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const {SCHEME, APP_URL, staticPath, allowedExternal, allowedAppNavigation, allowedResource, allowedDownload} = require('./security.cjs');
app.setName('AstrOctopi');
app.setAppUserModelId('com.astroctopi.app');
protocol.registerSchemesAsPrivileged([{scheme:SCHEME, privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true}}]);
const CONTENT_POLICY = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; media-src 'self' blob:; worker-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'";
const DIST = path.join(__dirname, '..', 'dist');
let window = null;
function openReference(url) {
  if (allowedExternal(url)) void shell.openExternal(url).catch(() => {
    if (window) void dialog.showMessageBox(window,{type:'info',title:'Open reference',message:'The reference could not open in your default browser. An internet connection may be needed.'});
  });
}
function makeMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {label:'File',submenu:[
      {label:'Lock profile',accelerator:'CmdOrCtrl+L',click:()=>window?.webContents.reload()},
      {type:'separator'}, {role:'quit'}
    ]},
    {label:'Edit',submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}]},
    {label:'View',submenu:[{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{type:'separator'},{role:'togglefullscreen'}]},
    {label:'Help',submenu:[
      {label:'NASA space health research',click:()=>openReference('https://www.nasa.gov/hrp/')},
      {label:'About AstrOctopi',click:()=>void dialog.showMessageBox(window,{type:'info',title:'AstrOctopi',message:`AstrOctopi ${app.getVersion()}`,detail:'Your little space for wellbeing.\n\nDesktop edition: records are encrypted and saved on this computer. Existing website logs can be transferred with an encrypted mission backup.\n\nThis demonstration is not a medical device. Example ranges require review by a flight surgeon.',icon:path.join(__dirname,'assets','icon.png')})}
    ]}
  ]));
}
async function configureSession() {
  const ses = session.fromPartition('persist:astroctopi');
  ses.setPermissionRequestHandler((_webContents,_permission,callback)=>callback(false));
  ses.setPermissionCheckHandler(()=>false);
  ses.webRequest.onBeforeRequest((details,callback)=>callback({cancel:!allowedResource(details.url)}));
  ses.on('will-download',(event,item)=>{
    const url=item.getURL();
    // Backups are local Blob URLs; the only packaged download is the authored source ZIP. Never run downloads.
    if (!allowedDownload(url)) {event.preventDefault();return;}
    const safeName=path.basename(item.getFilename()).replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_');
    const sourceArchive=url==='astroctopi://app/astroctopi-source.zip';
    item.setSaveDialogOptions({title:sourceArchive?'Save AstrOctopi source':'Save AstrOctopi log',defaultPath:path.join(app.getPath('documents'),safeName),filters:sourceArchive?[{name:'AstrOctopi source ZIP',extensions:['zip']}]:[{name:'JSON log or encrypted backup',extensions:['json']}],showsTagField:false});
  });
  await ses.protocol.handle(SCHEME,async request=>{
    if (!['GET','HEAD'].includes(request.method)) return new Response('Method not allowed',{status:405,headers:{Allow:'GET, HEAD'}});
    const asset=staticPath(request.url,DIST);
    if (!asset) return new Response('Not found',{status:404});
    try {
      const resolved=await fs.realpath(asset.file);
      const root=await fs.realpath(DIST);
      if (!resolved.startsWith(root+path.sep)) return new Response('Not found',{status:404});
      const bytes=await fs.readFile(resolved);
      return new Response(request.method==='HEAD'?null:bytes,{headers:{'Content-Type':asset.type,'Content-Length':String(bytes.byteLength),'Content-Security-Policy':CONTENT_POLICY,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Cross-Origin-Resource-Policy':'same-origin'}});
    } catch {return new Response('Not found',{status:404});}
  });
  return ses;
}
function createWindow(ses) {
  window=new BrowserWindow({width:1360,height:930,minWidth:760,minHeight:600,show:false,title:'AstrOctopi',backgroundColor:'#f6f8fc',icon:path.join(__dirname,'assets','icon.png'),webPreferences:{session:ses,nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true,allowRunningInsecureContent:false,webviewTag:false,devTools:false,spellcheck:false}});
  window.webContents.setWindowOpenHandler(({url})=>{openReference(url);return {action:'deny'};});
  window.webContents.on('will-navigate',(event,url)=>{const target=url||event.url;if(!allowedAppNavigation(target)){event.preventDefault();openReference(target);}});
  window.webContents.on('will-redirect',(event,url)=>{if(!allowedAppNavigation(url||event.url))event.preventDefault();});
  window.webContents.on('will-frame-navigate',(event,details)=>{const url=typeof details==='string'?details:details?.url||event.url;if(!allowedAppNavigation(url))event.preventDefault();});
  window.webContents.on('will-attach-webview',event=>event.preventDefault());
  window.once('ready-to-show',()=>window?.show());
  window.on('closed',()=>{window=null;});
  window.webContents.on('render-process-gone',()=>{
    if(window) void dialog.showMessageBox(window,{type:'error',title:'AstrOctopi needs a restart',message:'The local app closed unexpectedly. Your last saved encrypted records remain on this computer.',buttons:['Restart app','Close']}).then(({response})=>{if(response===0)window?.webContents.reload();else app.quit();});
  });
  void window.loadURL(APP_URL).catch(()=>{
    dialog.showErrorBox('AstrOctopi could not start','The local app files could not be loaded. Reinstall AstrOctopi; your saved data is kept separately from the program files.');app.quit();
  });
}
if(!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance',()=>{if(window){if(window.isMinimized())window.restore();window.show();window.focus();}});
  app.whenReady().then(async()=>{const ses=await configureSession();makeMenu();createWindow(ses);app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow(ses);});}).catch(()=>{dialog.showErrorBox('AstrOctopi could not start','The app could not initialize its local storage. Restart the app or reinstall it without removing your saved records.');app.quit();});
  app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});
}
