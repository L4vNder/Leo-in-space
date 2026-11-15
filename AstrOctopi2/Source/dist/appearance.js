/* AstrOctopi appearance controls. Public, non-medical display preferences only. */
const KEY='astroctopi.appearance.v1';
const HEX=/^#[0-9a-f]{6}$/i;
const CHANNELS=['accent','search','background','surface'];

// The default Orbit palette retains the exact light/dark colors of the original AstrOctopi prototype.
export const PALETTES={
  orbit:{label:'Original orbit',light:{background:'#f2f8fd',surface:'#ffffff',accent:'#7fb4e6',search:'#e6f1fb'},dark:{background:'#0b0c12',surface:'#161826',accent:'#f6e7a6',search:'#1e2132'}},
  lavender:{label:'Moon lavender',light:{background:'#f6f3ff',surface:'#ffffff',accent:'#a18cde',search:'#e9e3fb'},dark:{background:'#151323',surface:'#211d34',accent:'#c6adff',search:'#312b4a'}},
  seafoam:{label:'Sea glass',light:{background:'#effaf7',surface:'#ffffff',accent:'#72bdac',search:'#d9f3ec'},dark:{background:'#0e1c1c',surface:'#182b2a',accent:'#9fdfc6',search:'#203a38'}},
  peach:{label:'Peach nebula',light:{background:'#fff6ef',surface:'#ffffff',accent:'#e8a17e',search:'#fce8db'},dark:{background:'#201718',surface:'#302326',accent:'#ffc39e',search:'#3c2b2d'}},
  rose:{label:'Cosmic rose',light:{background:'#fff4f8',surface:'#ffffff',accent:'#dc94b2',search:'#f9e0eb'},dark:{background:'#21151e',surface:'#30232e',accent:'#f5b2ce',search:'#412d3b'}},
  glacier:{label:'Ice blue',light:{background:'#eff7ff',surface:'#ffffff',accent:'#84aee5',search:'#deebfc'},dark:{background:'#111b2b',surface:'#1d2b40',accent:'#a9c8f0',search:'#293b54'}},
};
const blank=()=>({accent:null,search:null,background:null,surface:null});
const fresh=()=>({mode:'light',palette:'orbit',custom:{light:blank(),dark:blank()}});
let settings=fresh();
let initialized=false;
let mediaQuery=null;
let panelRoot=null;
let returnFocus=null;
let feedback=()=>{};
const validHex=v=>typeof v==='string'&&HEX.test(v)?v.toLowerCase():null;
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const systemMode=()=>mediaQuery?.matches?'dark':'light';
export function actualMode(){return settings.mode==='system'?systemMode():settings.mode;}
export function appearanceState(){return JSON.parse(JSON.stringify(settings));}
export function parseAppearance(raw){
  const base=fresh();let value;
  try{value=typeof raw==='string'?JSON.parse(raw):raw;}catch{return base;}
  if(!value||typeof value!=='object'||Array.isArray(value))return base;
  if(['light','dark','system'].includes(value.mode))base.mode=value.mode;
  if(Object.hasOwn(PALETTES,value.palette))base.palette=value.palette;
  for(const mode of ['light','dark'])for(const key of CHANNELS)
    base.custom[mode][key]=validHex(value.custom?.[mode]?.[key]);
  return base;
}
export function currentColors(mode=actualMode()){
  const theme=mode==='dark'?'dark':'light';
  return {...PALETTES[settings.palette][theme],...Object.fromEntries(CHANNELS.map(key=>[key,settings.custom[theme][key]||PALETTES[settings.palette][theme][key]]))};
}
function mix(hex,other,weight){const s=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));return '#'+s(hex).map((v,i)=>Math.round(v*(1-weight)+s(other)[i]*weight).toString(16).padStart(2,'0')).join('');}
export function readableInk(hex){const channels=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);const luminance=channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;return luminance>.179?'#171c2b':'#ffffff';}
export function applyAppearance(){
  const mode=actualMode(),c=currentColors(mode),root=document.documentElement;
  const ink=mode==='dark'?'#f4efe0':'#1b2a3f';
  const muted=mode==='dark'?'#a6aec5':'#5f7189';
  const edge=mode==='dark'?'#2a2e45':'#cfe0f0';
  const raised=mix(c.surface,mode==='dark'?'#ffffff':'#23466b',mode==='dark'?.075:.045);
  const styles={
    '--theme-bg':c.background,'--theme-card':c.surface,'--theme-raised':raised,
    '--theme-search':c.search,'--theme-search-ink':readableInk(c.search),
    '--theme-accent':c.accent,'--theme-accent-ink':readableInk(c.accent),
    '--theme-accent-soft':mix(c.accent,c.surface,mode==='dark'?.82:.80),
    '--theme-ink':ink,'--theme-muted':muted,'--theme-line':edge,
    '--theme-hover':mix(c.surface,c.accent,mode==='dark'?.16:.10),
    '--theme-action':mode==='dark'?'#c9d8f1':'#34577d',
    '--theme-pill':mode==='dark'?'#28324b':'#e6edf7',
  };
  for(const [property,value] of Object.entries(styles))root.style.setProperty(property,value);
  root.dataset.theme=mode;
  root.style.colorScheme=mode;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content',c.background);
  document.dispatchEvent(new CustomEvent('astroctopi:appearance',{detail:{mode,colors:c}}));
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(settings));}catch{/* private window or storage blocked: in-session theme still works */}applyAppearance();}
export function updateAppearance(change){
  if(change.mode&&['light','dark','system'].includes(change.mode))settings.mode=change.mode;
  if(change.palette&&Object.hasOwn(PALETTES,change.palette)){
    settings.palette=change.palette;
    settings.custom[actualMode()]=blank();
  }
  if(change.channel&&CHANNELS.includes(change.channel)){
    const value=change.value===null?null:validHex(change.value);
    if(value!==null||change.value===null)settings.custom[actualMode()][change.channel]=value;
  }
  save();
  if(panelRoot?.isConnected)renderPanel();
}
export function resetAppearance(){settings=fresh();save();if(panelRoot?.isConnected)renderPanel();}
function renderPanel(){
  if(!panelRoot)return;
  const mode=actualMode(),c=currentColors(),custom=settings.custom[mode];
  panelRoot.innerHTML=`<div class="appearance-scrim" data-close-appearance></div><section class="appearance-panel" role="dialog" aria-modal="true" aria-labelledby="appearance-heading">
  <div class="appearance-heading"><div><div class="eyebrow">MAKE YOUR SPACE YOURS</div><h2 id="appearance-heading">Customize AstrOctopi</h2><p>Just like customizing a new tab — with your own cosmic palette.</p></div><button type="button" class="circle-button appearance-close" data-close-appearance aria-label="Close appearance settings">×</button></div>
  <div class="appearance-preview" aria-hidden="true"><div class="appearance-preview-top"><span>✦</span><span class="appearance-preview-pill">AstrOctopi</span><span>☼</span></div><div class="appearance-preview-search"><span>⌕</span><span>Search your space…</span><span>⌘ K</span></div><div class="appearance-preview-cards"><i></i><i></i><i></i></div></div>
  <div class="appearance-group"><h3>Appearance</h3><div class="appearance-modes" role="group" aria-label="Appearance mode">${[['light','☀','Light'],['dark','☾','Dark'],['system','◐','Device']].map(([value,symbol,label])=>`<button type="button" class="appearance-mode ${settings.mode===value?'selected':''}" data-mode="${value}" aria-pressed="${settings.mode===value}"><span aria-hidden="true">${symbol}</span>${label}</button>`).join('')}</div></div>
  <div class="appearance-group"><div class="row between"><h3>Color themes</h3><span class="appearance-help">Choose a palette</span></div><div class="appearance-presets">${Object.entries(PALETTES).map(([id,p])=>`<button type="button" class="appearance-preset ${settings.palette===id?'selected':''}" data-palette="${id}" title="${escape(p.label)}" aria-pressed="${settings.palette===id}"><span class="appearance-preset-art" style="--swatch-bg:${p[mode].background};--swatch-card:${p[mode].surface};--swatch-accent:${p[mode].accent};--swatch-search:${p[mode].search}"><span></span><b></b><i></i></span><span>${escape(p.label)}</span></button>`).join('')}</div></div>
  <div class="appearance-group"><h3>Fine-tune your colors</h3><p class="appearance-help">Customize individual parts of the page. Changes are saved on this device, separately for light and dark modes.</p><div class="appearance-color-list">${[['accent','Buttons & highlights'],['search','Search bar'],['background','Page background'],['surface','Cards & panels']].map(([key,label])=>`<div class="appearance-color-row"><label for="appearance-${key}">${label}</label><span class="appearance-hex">${c[key].toUpperCase()}</span><input type="color" id="appearance-${key}" data-color-channel="${key}" aria-label="${label} color" value="${c[key]}"><button type="button" class="appearance-clear" data-clear-color="${key}" ${!custom[key]?'disabled':''} title="Use palette color for ${label}" aria-label="Reset ${label} to palette">↺</button></div>`).join('')}</div></div>
  <div class="appearance-bottom"><button type="button" class="button" data-reset-appearance>Reset to original</button><p>Color settings do not change crew medical records.</p></div>
  </section>`;
  // Preview uses the same live colors as the actual app, not a separate simulated palette.
  const inputs=panelRoot.querySelectorAll('[data-color-channel]');
  for(const input of inputs){input.addEventListener('input',()=>{
    const field=input.dataset.colorChannel;
    settings.custom[actualMode()][field]=validHex(input.value);
    save();
    const hex=input.closest('.appearance-color-row')?.querySelector('.appearance-hex');if(hex)hex.textContent=input.value.toUpperCase();
  });}
  panelRoot.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>updateAppearance({mode:b.dataset.mode}));
  panelRoot.querySelectorAll('[data-palette]').forEach(b=>b.onclick=()=>updateAppearance({palette:b.dataset.palette}));
  panelRoot.querySelectorAll('[data-clear-color]').forEach(b=>b.onclick=()=>updateAppearance({channel:b.dataset.clearColor,value:null}));
  panelRoot.querySelector('[data-reset-appearance]').onclick=()=>{resetAppearance();feedback('Original colors restored.');};
  panelRoot.querySelectorAll('[data-close-appearance]').forEach(b=>b.onclick=closeAppearance);
}
export function openAppearance(){
  if(panelRoot?.isConnected){closeAppearance();return;}
  returnFocus=document.activeElement;
  panelRoot=document.createElement('div');panelRoot.id='appearance-root';document.body.appendChild(panelRoot);
  renderPanel();panelRoot.querySelector('.appearance-close')?.focus();
  document.addEventListener('keydown',appearanceKeydown);
}
function appearanceKeydown(e){
  if(e.key==='Escape'){e.preventDefault();closeAppearance();return;}
  if(e.key!=='Tab'||!panelRoot)return;
  const controls=[...panelRoot.querySelectorAll('button:not(:disabled),input:not(:disabled)')];
  const first=controls[0],last=controls.at(-1);
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
}
export function closeAppearance(){if(!panelRoot)return;panelRoot.remove();panelRoot=null;document.removeEventListener('keydown',appearanceKeydown);returnFocus?.focus?.();}
export function initializeAppearance(toast=()=>{}){
  feedback=toast;
  if(initialized)return applyAppearance();
  initialized=true;
  try{settings=parseAppearance(localStorage.getItem(KEY));}catch{settings=fresh();}
  if(typeof window.matchMedia==='function'){
    mediaQuery=window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener?.('change',()=>{if(settings.mode==='system')applyAppearance();if(panelRoot?.isConnected)renderPanel();});
  }
  window.addEventListener('storage',e=>{if(e.key===KEY){settings=parseAppearance(e.newValue);applyAppearance();if(panelRoot?.isConnected)renderPanel();}});
  applyAppearance();
}
