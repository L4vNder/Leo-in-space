/* AstrOctopi's device-local encrypted records. No health records leave this device. */
const STORAGE_KEY = 'astroctopi.mission.v1';
const ITERATIONS = 250000;
const encoder = new TextEncoder();
const decoder = new TextDecoder();
const keys = new Map();
let activeMissionId = null;
let medicalSession = false;
const failures = new Map();

export const METRICS = [
  {id:'hr',name:'Resting heart rate',unit:'bpm',min:20,max:250,green:[50,100],yellow:[40,120],step:1,method:'ECG or mission-approved heart-rate sensor',description:'Record after resting. Exercise, personal baseline, medication and symptoms affect interpretation.'},
  {id:'spo2',name:'Oxygen saturation',unit:'%',min:50,max:100,green:[95,100],yellow:[92,100],step:1,method:'Mission-approved fingertip pulse oximeter, if carried',description:'Check sensor contact and repeat an unexpected value. Cabin conditions and the medical plan matter.'},
  {id:'systolic',name:'Systolic blood pressure',unit:'mmHg',min:50,max:260,green:[90,129],yellow:[80,159],step:1,method:'Upper-arm blood-pressure cuff',description:'Measure with the approved technique after rest; interpret alongside diastolic pressure and the crew baseline.'},
  {id:'diastolic',name:'Diastolic blood pressure',unit:'mmHg',min:30,max:180,green:[60,84],yellow:[50,99],step:1,method:'Upper-arm blood-pressure cuff',description:'The lower pressure in a cuff reading. A single result does not establish a diagnosis.'},
  {id:'temp',name:'Body temperature',unit:'°C',min:32,max:43,green:[36,37.5],yellow:[35.5,38],step:0.1,method:'Mission-approved thermometer',description:'Record the same measurement site. Skin temperature from a wearable is not interchangeable with body temperature.'},
  {id:'respiratory',name:'Resting breathing rate',unit:'breaths/min',min:3,max:60,green:[12,20],yellow:[10,24],step:1,method:'Respiration sensor or timed manual count',description:'Count at rest. Workload, stress and symptoms change breathing rate.'},
  {id:'glucose',name:'Blood glucose',unit:'mg/dL',min:20,max:600,green:[70,99],yellow:[60,125],step:1,method:'Mission-approved blood glucose analyzer or CGM, only if carried',description:'These example bands apply to fasting readings only. A normal wrist band cannot measure blood glucose. Meal context and the clinician plan are essential.'}
];

function cryptoApi() {
  if (!globalThis.crypto?.subtle) throw new Error('Secure encryption requires HTTPS or a supported local browser.');
  return globalThis.crypto;
}
function bytesToBase64(bytes) {
  let result = '';
  for (let i=0;i<bytes.length;i++) result += String.fromCharCode(bytes[i]);
  return btoa(result);
}
function base64ToBytes(text) {
  if (typeof text !== 'string' || text.length > 14000000 || !/^[A-Za-z0-9+/]*={0,2}$/.test(text)) throw new Error('Invalid encrypted data.');
  return Uint8Array.from(atob(text), c => c.charCodeAt(0));
}
function randomBytes(length) {return cryptoApi().getRandomValues(new Uint8Array(length));}
function id() {return cryptoApi().randomUUID();}
function clone(value) {return JSON.parse(JSON.stringify(value));}
function string(value,max=100) {return typeof value==='string' ? value.trim().slice(0,max) : '';}
function validatePass(pass) {
  if (typeof pass!=='string' || pass.length<6 || pass.length>200) throw new Error('Use a passcode or passphrase with 6–200 characters.');
}
async function derive(pass,salt) {
  validatePass(pass);
  const material = await cryptoApi().subtle.importKey('raw',encoder.encode(pass),'PBKDF2',false,['deriveKey']);
  return cryptoApi().subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:base64ToBytes(salt),iterations:ITERATIONS},material,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function importKey(raw) {return cryptoApi().subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']);}
async function encrypt(raw,key,aad) {
  const iv=randomBytes(12);
  const ciphertext=await cryptoApi().subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(aad)},key,raw);
  return {iv:bytesToBase64(iv),ciphertext:bytesToBase64(new Uint8Array(ciphertext))};
}
async function decrypt(envelope,key,aad) {
  return cryptoApi().subtle.decrypt({name:'AES-GCM',iv:base64ToBytes(envelope.iv),additionalData:encoder.encode(aad)},key,base64ToBytes(envelope.ciphertext));
}
function read() {
  let raw;
  try {raw=localStorage.getItem(STORAGE_KEY);} catch {throw new Error('Browser storage is unavailable. Enable storage to use AstrOctopi.');}
  if(!raw) return null;
  try {return validateMission(JSON.parse(raw));} catch {throw new Error('This mission file is damaged. Restore an encrypted backup before continuing.');}
}
function write(mission) {
  try {localStorage.setItem(STORAGE_KEY,JSON.stringify(mission));} catch {throw new Error('The encrypted record could not be saved. Storage may be full or disabled. Export a backup before closing.');}
}
function validateEnvelope(envelope) {
  if(!envelope || typeof envelope!=='object') throw new Error('Invalid backup.');
  if(base64ToBytes(envelope.iv).length!==12 || base64ToBytes(envelope.ciphertext).length<16) throw new Error('Invalid encrypted record.');
}
function validateMission(value) {
  if(!value || value.version!==1 || typeof value.id!=='string' || typeof value.name!=='string' || !Array.isArray(value.profiles) || value.profiles.length<1 || value.profiles.length>12 || !value.vaults || !value.admin) throw new Error('Invalid mission backup.');
  if(base64ToBytes(value.admin.salt).length!==16) throw new Error('Invalid backup.');
  validateEnvelope(value.admin.check);
  const ids=new Set();
  for(const profile of value.profiles) {
    if(!profile || typeof profile.id!=='string' || ids.has(profile.id) || !string(profile.name) || !value.vaults[profile.id]) throw new Error('Invalid crew profile.');
    ids.add(profile.id);
    const vault=value.vaults[profile.id];
    if(base64ToBytes(vault.salt).length!==16) throw new Error('Invalid backup.');
    for(const kind of ['personal','admin','data']) validateEnvelope(vault[kind]);
  }
  return value;
}
function publicView(mission) {
  return {version:mission.version,id:mission.id,name:mission.name,createdAt:mission.createdAt,demo:!!mission.demo,profiles:mission.profiles.map(p=>({id:p.id,name:p.name,role:p.role,color:p.color,pfp:p.pfp}))};
}
export function getMission() {const mission=read();return mission ? publicView(mission):null;}
export function lock() {keys.clear();activeMissionId=null;medicalSession=false;}

export async function setupMission({name,adminPass,profiles,demo=false}) {
  if(read()) throw new Error('A mission already exists. Export a backup before replacing it.');
  validatePass(adminPass);
  if(!Array.isArray(profiles) || profiles.length<1 || profiles.length>12) throw new Error('Add between 1 and 12 crew members.');
  for(const p of profiles) {if(!string(p.name)) throw new Error('Each astronaut needs a name.');validatePass(p.pin);}
  const mission={version:1,id:id(),name:string(name)||'Asteria mission',createdAt:new Date().toISOString(),demo:!!demo,profiles:[],vaults:{},admin:{salt:bytesToBase64(randomBytes(16))}};
  const adminKey=await derive(adminPass,mission.admin.salt);
  mission.admin.check=await encrypt(encoder.encode('AstrOctopi medical access v1'),adminKey,mission.id+':admin-check');
  for(let index=0;index<profiles.length;index++) {
    const supplied=profiles[index];
    const profile={id:id(),name:string(supplied.name,60),role:string(supplied.role,80)||'Mission specialist',color:/^#[0-9a-fA-F]{6}$/.test(supplied.color)?supplied.color:['#b6b1ef','#a7d8d6','#f4cda9','#b4c9e8'][index%4],pfp:string(supplied.pfp,100)||'octopus'};
    mission.profiles.push(profile);
    const raw=randomBytes(32);
    const dek=await importKey(raw);
    const salt=bytesToBase64(randomBytes(16));
    const personalKey=await derive(supplied.pin,salt);
    const data=demo ? seedData(index) : emptyData(profile);
    data.pet.color=profile.color;
    mission.vaults[profile.id]={salt,personal:await encrypt(raw,personalKey,mission.id+':'+profile.id+':personal'),admin:await encrypt(raw,adminKey,mission.id+':'+profile.id+':admin'),data:await encrypt(encoder.encode(JSON.stringify(data)),dek,mission.id+':'+profile.id+':data')};
    raw.fill(0);
  }
  write(mission);lock();return publicView(mission);
}

export async function demoMission() {
  return setupMission({name:'Asteria · Expedition 12',adminPass:'mission-control',demo:true,profiles:[
    {name:'Luna Chen',role:'Mission commander',pin:'123456',color:'#b6b1ef',pfp:'🌙'},
    {name:'Alex Rivera',role:'Flight engineer',pin:'123456',color:'#a7d8d6',pfp:'🪐'},
    {name:'Amara Okafor',role:'Science officer',pin:'123456',color:'#f4cda9',pfp:'🌻'},
    {name:'Noah Park',role:'Medical officer',pin:'123456',color:'#b4c9e8',pfp:'🌊'}
  ]});
}

function rateLimit(identity) {
  const failed=failures.get(identity);
  if(failed && failed.until>Date.now()) throw new Error('Too many attempts. Wait a minute before trying again.');
}
function fail(identity) {
  const failed=failures.get(identity)||{count:0,until:0};
  failed.count++;
  if(failed.count>=5){failed.until=Date.now()+60000;failed.count=0;}
  failures.set(identity,failed);
}

export async function unlockProfile(profileId,pin) {
  lock();
  const mission=read();
  if(!mission) throw new Error('Set up a mission first.');
  const profile=mission.profiles.find(p=>p.id===profileId);
  if(!profile) throw new Error('Crew profile not found.');
  rateLimit(profileId);
  try {
    const vault=mission.vaults[profileId];
    const key=await derive(pin,vault.salt);
    const raw=new Uint8Array(await decrypt(vault.personal,key,mission.id+':'+profileId+':personal'));
    const dek=await importKey(raw);raw.fill(0);
    const data=JSON.parse(decoder.decode(await decrypt(vault.data,dek,mission.id+':'+profileId+':data')));
    validateData(data);
    keys.set(profileId,dek);activeMissionId=mission.id;failures.delete(profileId);
    return {profile:clone(profile),data};
  } catch {fail(profileId);throw new Error('That passcode did not unlock this profile.');}
}

export async function unlockAdmin(pass) {
  lock();
  const mission=read();
  if(!mission) throw new Error('Set up a mission first.');
  rateLimit('medical');
  try {
    const key=await derive(pass,mission.admin.salt);
    const check=decoder.decode(await decrypt(mission.admin.check,key,mission.id+':admin-check'));
    if(check!=='AstrOctopi medical access v1') throw new Error('Invalid access.');
    const records=[];
    const unlocked=new Map();
    for(const profile of mission.profiles) {
      const vault=mission.vaults[profile.id];
      const raw=new Uint8Array(await decrypt(vault.admin,key,mission.id+':'+profile.id+':admin'));
      const dek=await importKey(raw);raw.fill(0);
      const data=JSON.parse(decoder.decode(await decrypt(vault.data,dek,mission.id+':'+profile.id+':data')));
      validateData(data);unlocked.set(profile.id,dek);records.push({profile:clone(profile),data});
    }
    for(const [profileId,key] of unlocked) keys.set(profileId,key);
    activeMissionId=mission.id;medicalSession=true;failures.delete('medical');return records;
  } catch {lock();fail('medical');throw new Error('That passphrase did not unlock medical access.');}
}

function validateData(data) {
  if(!data || !Array.isArray(data.metrics) || !data.pet || !Array.isArray(data.sleep) || !Array.isArray(data.water) || !Array.isArray(data.meals) || !Array.isArray(data.exercise) || !Array.isArray(data.mood) || !Array.isArray(data.cognition) || !data.goals || !data.reminders || !Array.isArray(data.inventory) || !data.tasks || !Array.isArray(data.tasks.done)) throw new Error('Invalid health record.');
  if(JSON.stringify(data).length>4000000) throw new Error('This record is too large. Export and archive older entries.');
  for(const [metricId,bands] of Object.entries(data.ranges||{})) {
    const metric=METRICS.find(m=>m.id===metricId);
    if(!metric || !validRangeBands(bands,metric)) throw new Error('Color bands must be finite, ordered, and nested within valid metric values.');
  }
  for(const measurement of data.metrics) {
    const metric=METRICS.find(m=>m.id===measurement.id);
    if(!metric || !Number.isFinite(measurement.value) || measurement.value<metric.min || measurement.value>metric.max || !Number.isFinite(Date.parse(measurement.at)) || typeof measurement.source!=='string' || !measurement.source.trim() || !['resting','fasting','after-meal','exercise','post-exercise','unknown'].includes(measurement.context)) throw new Error('A measurement has an invalid value, timestamp, source, or context.');
  }
}
export async function saveProfile(profileId,data,publicPatch={}) {
  const mission=read();
  if(!mission || activeMissionId!==mission.id || !keys.has(profileId)) throw new Error('Unlock your own profile before saving.');
  validateData(data);
  const profile=mission.profiles.find(p=>p.id===profileId);
  if(!profile) throw new Error('Crew profile not found.');
  const clean=clone(data);
  if(!medicalSession) {
    const stored=JSON.parse(decoder.decode(await decrypt(mission.vaults[profileId].data,keys.get(profileId),mission.id+':'+profileId+':data')));
    if(JSON.stringify(stored.ranges||{})!==JSON.stringify(clean.ranges||{})) throw new Error('Only authorized medical access may change color bands.');
  }
  mission.vaults[profileId].data=await encrypt(encoder.encode(JSON.stringify(clean)),keys.get(profileId),mission.id+':'+profileId+':data');
  if(typeof publicPatch.name==='string' && string(publicPatch.name)) profile.name=string(publicPatch.name,60);
  if(typeof publicPatch.role==='string') profile.role=string(publicPatch.role,80);
  if(typeof publicPatch.pfp==='string') profile.pfp=string(publicPatch.pfp,100);
  if(/^#[0-9a-fA-F]{6}$/.test(publicPatch.color)) profile.color=publicPatch.color;
  write(mission);return {profile:clone(profile),data:clone(clean)};
}
export function exportBackup() {
  const mission=read();
  if(!mission) throw new Error('There is no mission to export.');
  return JSON.stringify({format:'astroctopi-encrypted-backup',exportedAt:new Date().toISOString(),mission},null,2);
}
export function restoreBackup(text) {
  if(typeof text!=='string' || text.length>18000000) throw new Error('Choose an AstrOctopi encrypted backup smaller than 18 MB.');
  let value;try {value=JSON.parse(text);}catch {throw new Error('This file is not valid JSON.');}
  if(value.format!=='astroctopi-encrypted-backup') throw new Error('This is not an AstrOctopi encrypted backup.');
  const mission=validateMission(value.mission);
  // Build a canonical record so unknown imported properties cannot become public fields.
  const safe={version:1,id:mission.id,name:string(mission.name),createdAt:mission.createdAt,demo:!!mission.demo,admin:mission.admin,vaults:mission.vaults,profiles:publicView(mission).profiles};
  write(safe);lock();return publicView(safe);
}
export function resetMission() {lock();localStorage.removeItem(STORAGE_KEY);}

export function metricStatus(metricId,value,context='resting',timestamp,ranges={}) {
  const metric=METRICS.find(m=>m.id===metricId);
  if(!metric || !Number.isFinite(value) || value<metric.min || value>metric.max) return 'unknown';
  if(!timestamp || !Number.isFinite(Date.parse(timestamp))) return 'unknown';
  const age=Date.now()-Date.parse(timestamp);
  if(age< -300000 || age>(metricId==='glucose'?12:24)*3600000) return 'unknown';
  if(metricId==='glucose' ? context!=='fasting' : context!=='resting') return 'unknown';
  const custom=ranges?.[metricId] || ranges;
  const hasCustom=custom && (Object.hasOwn(custom,'green') || Object.hasOwn(custom,'yellow'));
  if(hasCustom && !validRangeBands(custom,metric)) return 'unknown';
  const green=hasCustom?custom.green:metric.green;
  const yellow=hasCustom?custom.yellow:metric.yellow;
  if(value>=green[0] && value<=green[1]) return 'green';
  if(value>=yellow[0] && value<=yellow[1]) return 'yellow';
  return 'red';
}

function validRangeBands(bands,metric) {
  const band=b=>Array.isArray(b)&&b.length===2&&b.every(Number.isFinite);
  return bands && band(bands.green) && band(bands.yellow) && metric.min<=bands.yellow[0] && bands.yellow[0]<=bands.green[0] && bands.green[0]<=bands.green[1] && bands.green[1]<=bands.yellow[1] && bands.yellow[1]<=metric.max;
}

function emptyData(profile={}) {
  return {metrics:[],sleep:[],water:[],meals:[],exercise:[],mood:[],cognition:[],tasks:{date:new Date().toISOString().slice(0,10),done:[]},pet:{name:'Orbit',color:profile.color||'#b6b1ef',hat:'none',accessory:'none'},reminders:{enabled:false,interval:60,voice:false,haptic:false},inventory:[],goals:{water:2500,sleep:8,exercise:120},ranges:{},audit:[]};
}
export function seedData(index=0) {
  const data=emptyData();
  data.inventory=[{id:'oats',name:'Maple oatmeal',kind:'food',qty:16,kcal:280,protein:9},{id:'curry',name:'Chickpea curry',kind:'food',qty:12,kcal:450,protein:20},{id:'salmon',name:'Salmon & rice',kind:'food',qty:10,kcal:520,protein:32},{id:'fruit',name:'Dried fruit mix',kind:'food',qty:20,kcal:140,protein:2},{id:'almonds',name:'Roasted almonds',kind:'food',qty:15,kcal:170,protein:6},{id:'water',name:'Potable water · 250 mL pouch',kind:'drink',ml:250,qty:120,kcal:0,protein:0}];
  const now=new Date();
  const at=new Date(now.getTime()-22*60000).toISOString();
  const today=now.toISOString().slice(0,10);
  const values={hr:[72,74,64,71][index%4],spo2:[98,97,98,99][index%4],systolic:116+index*2,diastolic:76+index,temp:36.7,respiratory:15+index%2,glucose:88+index*2};
  for(let day=6;day>=0;day--) {
    const date=new Date(now.getTime()-day*86400000).toISOString().slice(0,10);
    const sampleAt=day===0?at:new Date(now.getTime()-day*86400000).toISOString();
    for(const metric of METRICS) data.metrics.push({id:metric.id,value:Math.min(metric.max,Math.max(metric.min,Math.round((values[metric.id]+(day?Math.sin(day+index)*(metric.step===0.1?0.2:metric.id==='spo2'?0.5:3):0))*10)/10)),at:sampleAt,context:metric.id==='glucose'?'fasting':'resting',source:'Fictional demo reading'});
    data.sleep.push({date,hours:[7.2,7.8,6.6,8.1,7.3,7.7,6.8][6-day],quality:['Restful','Restful','Restless','Restful','Okay','Restful','Okay'][6-day]});
  }
  for(let i=0;i<5;i++) data.water.push({at:new Date(now.getTime()-(5-i)*3600000).toISOString(),ml:250});
  data.meals=[{at:new Date(now.getTime()-4*3600000).toISOString(),foodId:'oats',name:'Maple oatmeal',kcal:280,protein:9},{at:new Date(now.getTime()-2*3600000).toISOString(),foodId:'curry',name:'Chickpea curry',kcal:450,protein:20},{at:new Date(now.getTime()-3600000).toISOString(),foodId:'almonds',name:'Roasted almonds',kcal:170,protein:6}];
  data.exercise=[{at:new Date(now.getTime()-3*3600000).toISOString(),type:'Cycle ergometer',minutes:35}];
  data.mood=[{at:new Date(now.getTime()-2*3600000).toISOString(),score:4,stress:2,note:'Missing Earth a little. Looking forward to our crew dinner.',teamOptIn:false}];
  data.cognition=[{at:new Date(now.getTime()-86400000).toISOString(),reactionMs:286}];
  data.tasks={date:today,done:['vitals','water']};
  data.pet={name:['Orbit','Cosmo','Pip','Nova'][index%4],color:['#b6b1ef','#a7d8d6','#f4cda9','#b4c9e8'][index%4],hat:'astronaut',accessory:'none'};
  return data;
}
