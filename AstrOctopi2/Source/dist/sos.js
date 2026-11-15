/** AstrOctopi SOS drill (v1.3): UI-only Earth link and ship alarm simulation.
 * No network distress message, spacecraft light, or flight-hardware control occurs.
 * The scenario is chosen locally to demonstrate received/lost communications.
 */
const guides = [
  {
    id:'cardiac', icon:'♥', label:'Heart attack / cardiac arrest', short:'Chest symptoms, collapse, or abnormal breathing',
    keywords:['heart attack','cardiac','heart','chest pain','cpr','collapsed','collapse'], urgency:'MEDICAL · TIME CRITICAL',
    first:'Call the onboard medical lead. If someone is unresponsive and is not breathing normally, begin the trained cardiac-arrest response immediately.',
    steps:[
      ['Protect and assess','Check that the area is safe. Ask a crewmate to notify the medical officer and locate emergency medical equipment.'],
      ['Check responsiveness and breathing','For a collapsed person, check responsiveness and normal breathing. Gasping is not normal breathing.'],
      ['Start the approved resuscitation procedure','If unresponsive and not breathing normally, begin CPR according to mission training, including restraint/positioning techniques validated for microgravity. Use an AED if available and follow its prompts.'],
      ['If awake with chest symptoms','Have the person stop exertion, stay supported, and obtain urgent medical assessment. Do not give medication unless the medical protocol or flight surgeon directs it.'],
      ['Continue coordinated response','Keep monitoring, follow medical-officer instructions, and prepare clinical information for Mission Control when communications permit.']
    ], source:'American Heart Association · Cardiac arrest', url:'https://www.heart.org/en/health-topics/cardiac-arrest/emergency-treatment-of-cardiac-arrest'
  },
  {
    id:'decompression', icon:'◎', label:'Cabin decompression', short:'Pressure drop, air leak, or hypoxia warning',
    keywords:['decompression','depressurization','depressurisation','pressure','air leak','oxygen leak','hull breach'], urgency:'LIFE SUPPORT · IMMEDIATE',
    first:'Alert the crew; protect breathing and move toward the designated safe haven immediately as directed by the cabin-pressure emergency checklist.',
    steps:[
      ['Raise the pressure emergency','Use the approved cabin-pressure alarm and inform the crew. Confirm pressure/pressure-rate indications if safe.'],
      ['Protect breathing','Use assigned emergency breathing equipment or a pressure suit as dictated by training and vehicle procedures.'],
      ['Move to safe haven','Follow the vehicle-specific leak isolation and safe-haven checklist. Do not delay evacuation to investigate a leak if time is limited.'],
      ['Isolate only if trained and safe','Close designated hatches/valves only in the mission-approved order. Do not operate unfamiliar pressure-control systems.'],
      ['Check crew after securing','Account for crew and report symptoms to the onboard medical officer; follow approved hypoxia/decompression-injury care.']
    ], source:'NASA · ISS emergency operations', url:'https://ntrs.nasa.gov/citations/20220019247'
  },
  {
    id:'burn', icon:'♨', label:'Burn / thermal injury', short:'Hot equipment, liquid, or surface exposure',
    keywords:['burn','burns','scald','thermal','hot surface'], urgency:'MEDICAL · INJURY',
    first:'Stop exposure to the heat source, secure the area, and alert the medical officer.',
    steps:[
      ['Stop the burning process','Move away from heat if safe. Avoid contact with energized or hazardous equipment.'],
      ['Cool using mission-safe supplies','For a thermal burn, cool promptly with clean cool water if available and safe for the module, or an approved cool compress. Avoid ice directly on skin.'],
      ['Protect the wound','Remove loose jewelry or clothing near the injury if not stuck to skin. Do not remove adhered material or break blisters.'],
      ['Cover and reassess','Use an approved sterile non-stick covering and monitor for worsening pain, breathing difficulty, or shock.'],
      ['Get medical evaluation','Have the onboard medical officer assess significant, facial, electrical, or chemical burns, and follow the corresponding dedicated procedure.']
    ], source:'AHA / American Red Cross · First aid', url:'https://cpr.heart.org/en/resuscitation-science/2024-first-aid-guidelines'
  },
  {
    id:'radiation', icon:'☢', label:'Radiation event', short:'Solar particle event or exposure alert',
    keywords:['radiation','solar flare','solar storm','particle event','dosimeter'], urgency:'ENVIRONMENT · SHELTER',
    first:'Move the crew to the spacecraft’s designated radiation shelter and follow mission radiation-monitoring procedures.',
    steps:[
      ['Notify the crew','Communicate the radiation alert and stop nonessential exposed work, including EVA as mission rules direct.'],
      ['Seek the shielded location','Go to the vehicle-designated radiation shelter; position protective supplies only as approved in the mission plan.'],
      ['Minimize further exposure','Remain sheltered, limit unnecessary movements, and observe radiation instruments if available.'],
      ['Record exposure information','Document event timing and dosimeter readings when safe, then inform the medical officer.'],
      ['Await authorized all-clear','Do not leave the shelter on the basis of this app. Follow spacecraft operations and flight-surgeon guidance.']
    ], source:'CDC · Radiation emergency preparedness (general principles)', url:'https://www.cdc.gov/radiation-emergencies/response/get-inside.html'
  },
  {
    id:'fire', icon:'♨', label:'Fire / smoke in cabin', short:'Smoke detection, burning smell, or flame',
    keywords:['fire','smoke','flames','burning cabin'], urgency:'CABIN SAFETY · IMMEDIATE',
    first:'Sound the fire alarm, alert the crew, and follow the spacecraft fire emergency checklist.',
    steps:[
      ['Warn and protect the crew','Announce fire/smoke location and use assigned breathing protection if required.'],
      ['Follow vehicle-specific procedures','Use the onboard fire response checklist for ventilation, power isolation, and compartment controls.'],
      ['Fight a fire only if trained','Use only flight-certified extinguishing equipment, following its documented instructions and crew roles.'],
      ['Retreat if unsafe','Move to the designated safe area and close designated hatches per procedure if containment fails.'],
      ['Account for everyone','Check crew for smoke exposure and report conditions through the assigned command/medical channels.']
    ], source:'NASA · ISS Operating an Outpost', url:'https://www.nasa.gov/wp-content/uploads/2018/04/iss-operating_an_outpost-tagged.pdf'
  },
  {
    id:'toxic', icon:'⚠', label:'Toxic atmosphere / chemical leak', short:'Unknown odor, irritant, or atmosphere alarm',
    keywords:['toxic','chemical','ammonia','hazardous gas','poison','odor','atmosphere'], urgency:'AIR QUALITY · IMMEDIATE',
    first:'Alert the crew, avoid the affected compartment, and use emergency breathing protection per the atmosphere procedure.',
    steps:[
      ['Raise the atmosphere alert','Identify the suspected location and notify the crew using approved alarm and voice procedures.'],
      ['Protect the airway','Don assigned protective breathing equipment if instructed. Do not enter the suspected area without appropriate training.'],
      ['Isolate or evacuate','Move toward designated safe haven and isolate affected zones only by approved checklist.'],
      ['Avoid unapproved cleanup','Do not touch an unknown substance or attempt neutralization without identification and proper equipment.'],
      ['Request medical assessment','Have exposed crew evaluated and record symptoms and possible contaminant type when safe.']
    ], source:'NASA · ISS hazardous atmosphere response', url:'https://ntrs.nasa.gov/api/citations/20250003954/downloads/ICES-2025-126_Final_Rev%20A.pdf'
  },
  {
    id:'unresponsive', icon:'✚', label:'Unresponsive crewmate', short:'Fainting, unconsciousness, or seizure',
    keywords:['unresponsive','unconscious','fainting','seizure','not waking','passed out'], urgency:'MEDICAL · TIME CRITICAL',
    first:'Get the medical officer immediately; check responsiveness and normal breathing while keeping the person secure.',
    steps:[
      ['Secure the scene and patient','Prevent drifting or injury in microgravity and summon the medical response team.'],
      ['Check responsiveness and breathing','If the person is not breathing normally, follow the mission cardiac-arrest checklist and obtain the AED if available.'],
      ['If breathing normally','Maintain an open airway using trained techniques and monitor continuously. Do not give food, drink, or medications by mouth.'],
      ['If a seizure is occurring','Protect from nearby hazards; avoid restraint beyond necessary safety positioning and do not place anything in the mouth.'],
      ['Hand over to medical lead','Document when symptoms began and follow the trained emergency evaluation procedure.']
    ], source:'American Heart Association · Cardiac arrest', url:'https://www.heart.org/en/health-topics/cardiac-arrest/emergency-treatment-of-cardiac-arrest'
  }
];
let root, toast=()=>{}, status='idle', signal='received', scenario='received', timer=null, advanceTimer=null, alarmInterval=null, audioContext=null, selectedGuide=null, alarmOn=false;
let recognition=null, voiceMode='', voiceWanted=false, previousFocus=null;
const speechAvailable=()=>Boolean(window.SpeechRecognition||window.webkitSpeechRecognition);
const safe=(value)=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function sosHomeMarkup(){return `<section class="sos-home-panel" aria-label="SOS rescue drill"><div class="sos-home-copy"><div class="sos-overline"><span class="sos-live-dot"></span> CREW SAFETY · EMERGENCY CONSOLE</div><h2>Help is one signal away.<span class="sos-home-star"> ✦</span></h2><p>Press the emergency button to sound a local alarm, simulate an Earth distress signal, and open your rescue guide.</p><div class="sos-shortcuts"><span><kbd>SPACE</kbd> physical-button simulation</span><span>✦ Rescue guidance works without a signal</span></div><div class="sos-simulation-controls"><label for="sos-link-scenario">DEMO EARTH LINK</label><select id="sos-link-scenario" data-sos-scenario aria-label="Choose a simulated Earth-link outcome"><option value="received">Signal received</option><option value="lost">Signal lost</option></select><button type="button" data-sos-action="voice-home" class="sos-voice-home">🎙 <span id="sos-home-voice-label">Voice SOS</span></button></div></div><button type="button" class="sos-launch" data-sos-action="trigger" aria-label="Trigger SOS emergency drill"><span class="sos-launch-ring"><b>SOS</b><small>RESCUE SIGNAL</small></span><span class="sos-launch-caption">ACTIVATE EMERGENCY</span></button></section>`;}
export function sosTopButtonMarkup(){return `<button class="sos-top-button" data-sos-action="trigger" type="button" title="Trigger SOS rescue drill (Space)" aria-label="SOS rescue drill">✚ <span>SOS</span></button>`;}
function setAlarm(on){alarmOn=on;document.body.classList.toggle('sos-alert-active',on);if(on){try{if(navigator.vibrate)navigator.vibrate([250,120,250]);}catch{};startAudio();}else{clearInterval(alarmInterval);alarmInterval=null;if(audioContext){audioContext.close().catch(()=>{});audioContext=null;}}}
function startAudio(){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;try{audioContext=new Audio();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});const beep=()=>{if(!audioContext||!alarmOn)return;const t=audioContext.currentTime;for(const [offset,freq] of [[0,660],[.24,880],[.48,660]]){const osc=audioContext.createOscillator(),vol=audioContext.createGain();osc.type='sine';osc.frequency.value=freq;vol.gain.setValueAtTime(0.0001,t+offset);vol.gain.exponentialRampToValueAtTime(.055,t+offset+.016);vol.gain.exponentialRampToValueAtTime(0.0001,t+offset+.19);osc.connect(vol).connect(audioContext.destination);osc.start(t+offset);osc.stop(t+offset+.2);}};beep();alarmInterval=setInterval(beep,1900);}catch{audioContext=null;}}
function stopVoice(){voiceWanted=false;voiceMode='';if(recognition){const old=recognition;recognition=null;try{old.onend=null;old.abort();}catch{}};updateVoiceLabels();}
function updateVoiceLabels(){const home=document.getElementById('sos-home-voice-label');if(home)home.textContent=voiceMode==='home'?'Stop listening':'Voice SOS';const button=root?.querySelector('[data-sos-action="voice-guide"]');if(button)button.textContent=voiceMode==='guide'?'◉ Stop listening':'🎙 Voice: choose an issue';const stateText=root?.querySelector('#sos-voice-hint');if(stateText)stateText.textContent=voiceMode==='guide'?'Listening… Say “heart attack”, “decompression”, “burn”, “radiation”, “fire”, “toxic air”, or “unresponsive”.':'Select a guide by tapping it, or turn on voice selection.';}
function processVoice(text){const word=text.toLowerCase().trim();if(voiceMode==='home'){if(/\b(sos|mayday|emergency|help me)\b/.test(word)){stopVoice();activate();}return;}if(voiceMode!=='guide')return;if(/\b(silence|mute|quiet|stop alarm)\b/.test(word)){setAlarm(false);render();return;}if(/\b(back|list|categories)\b/.test(word)){selectedGuide=null;render();return;}const found=guides.find(g=>g.keywords.some(k=>word.includes(k)));if(found){selectedGuide=found.id;render();}};
function toggleVoice(mode){if(voiceMode===mode){stopVoice();return;}stopVoice();if(!speechAvailable()){toast('Voice recognition is not supported here. Use the buttons or Space key.');return;}const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;try{const r=new Recognition();recognition=r;voiceMode=mode;voiceWanted=true;r.lang='en-US';r.continuous=true;r.interimResults=false;r.maxAlternatives=1;r.onresult=e=>{for(let i=e.resultIndex;i<e.results.length;i++)if(e.results[i].isFinal)processVoice(e.results[i][0].transcript);};r.onerror=e=>{if(e.error!=='no-speech'&&e.error!=='aborted')toast('Voice control paused: '+e.error+'. You can always tap a guide.');};r.onend=()=>{if(recognition!==r)return;recognition=null;voiceMode='';voiceWanted=false;updateVoiceLabels();};r.start();updateVoiceLabels();}catch{stopVoice();toast('Could not start the microphone. Check browser permission.');}}
function modalShell(content){root.innerHTML=`<div class="sos-backdrop"><section class="sos-dialog" role="dialog" aria-modal="true" aria-labelledby="sos-title" tabindex="-1"><div class="sos-dialog-top"><div class="sos-badge"><span class="sos-indicator"></span> SOS RESPONSE · TRAINING SIMULATION</div><button type="button" class="sos-exit" data-sos-action="end">End drill ✕</button></div>${content}<div class="sos-dialog-bottom"><span>DEMO ONLY · No signal is transmitted to Earth · No spacecraft hardware connected</span><button type="button" data-sos-action="toggle-alarm" class="sos-alarm-toggle">${alarmOn?'◉ Silence local alarm':'◌ Local alarm silenced'}</button></div></section></div>`;root.querySelector('.sos-dialog')?.focus({preventScroll:true});}
function render(){document.body.classList.toggle('sos-modal-open',status!=='idle');if(status==='idle'){root.innerHTML='';return;}
 if(status==='transmitting'){
  modalShell(`<div class="sos-center-message"><div class="sos-transmission-orb">⌁</div><p class="sos-kicker">ESTABLISHING EARTH LINK</p><h2 id="sos-title">Sending SOS request…</h2><p>Attempting simulated transmission to Mission Control. The onboard alarm is active.</p><div class="sos-transmit-progress" role="progressbar" aria-label="Simulated SOS transmission in progress"><span></span></div><button type="button" data-sos-action="guides" class="sos-primary-action">Open rescue guide now →</button></div>`);return;}
 if(status==='result'){
  const received=signal==='received';modalShell(`<div class="sos-center-message"><div class="sos-signal-icon ${received?'sos-success':'sos-failure'}">${received?'✓':'!'}</div><p class="sos-kicker">SIMULATED EARTH-LINK STATUS</p><h2 id="sos-title">${received?'Signal received':'Signal lost'}</h2><p>${received?'Demo acknowledgement received from the simulated Earth link. No actual message was sent.':'The simulated Earth link is unavailable. Continue with onboard emergency procedures immediately.'}</p><div class="sos-signal-detail ${received?'good':'bad'}">${received?'●':'◌'} ${received?'DEMO ACKNOWLEDGEMENT':'NO DEMO ACKNOWLEDGEMENT'} <span>· Local alarm ${alarmOn?'active':'silenced'}</span></div><div class="sos-result-actions"><button type="button" data-sos-action="guides" class="sos-primary-action">Continue to rescue guide →</button><button type="button" data-sos-action="retry" class="sos-secondary-action">↻ Retry simulated signal</button></div><p class="sos-auto-note">Rescue guide opens automatically in a moment.</p></div>`);return;}
 const badge=`<div class="sos-link-mini ${signal==='received'?'good':'bad'}"><span>EARTH LINK</span><strong>${signal==='received'?'● Received (simulated)':'◌ Lost (simulated)'}</strong></div>`;
 if(!selectedGuide){modalShell(`<div class="sos-guide-head"><div><p class="sos-kicker">ONBOARD EMERGENCY ASSISTANCE</p><h2 id="sos-title">What’s happening?</h2><p>Select the current danger. The guidance remains available even if Earth contact is lost.</p></div>${badge}</div><div class="sos-voice-row"><button type="button" data-sos-action="voice-guide" class="sos-voice-toggle">🎙 Voice: choose an issue</button><span id="sos-voice-hint">Select a guide by tapping it, or turn on voice selection.</span></div><div class="sos-issue-grid">${guides.map(g=>`<button type="button" class="sos-issue" data-sos-action="issue" data-guide="${g.id}"><span class="sos-issue-icon">${g.icon}</span><span class="sos-issue-copy"><strong>${safe(g.label)}</strong><small>${safe(g.short)}</small></span><span class="sos-arrow">→</span></button>`).join('')}</div><p class="sos-guidance-note">Training aid only. Never substitute this screen for crew training, the onboard emergency checklist, or the flight surgeon.</p>`);}else{
  const g=guides.find(x=>x.id===selectedGuide);if(!g){selectedGuide=null;return render();}
  modalShell(`<div class="sos-guide-head sos-detail-head"><div><button type="button" data-sos-action="back" class="sos-text-back">← All emergencies</button><p class="sos-kicker">${safe(g.urgency)}</p><h2 id="sos-title">${safe(g.label)}</h2><p>${safe(g.short)}</p></div>${badge}</div><div class="sos-detail-callout"><strong>FIRST PRIORITY</strong><p>${safe(g.first)}</p></div><div class="sos-steps">${g.steps.map(([title,description],i)=>`<article class="sos-step"><span class="sos-step-num">${String(i+1).padStart(2,'0')}</span><div><h3>${safe(title)}</h3><p>${safe(description)}</p></div></article>`).join('')}</div><div class="sos-guide-tools"><button type="button" data-sos-action="back" class="sos-secondary-action">← Choose another danger</button><button type="button" data-sos-action="read" class="sos-secondary-action">◉ Read guide aloud</button><button type="button" data-sos-action="voice-guide" class="sos-voice-toggle">🎙 Voice: choose an issue</button></div><p class="sos-guidance-note">Informational training summary. Actual spaceflight responses require a mission-specific, flight-approved checklist. <a href="${g.url}" target="_blank" rel="noopener noreferrer">Supporting reference: ${safe(g.source)} ↗</a></p>`);
 }
 updateVoiceLabels();
}
function showGuides(){clearTimeout(advanceTimer);if(status==='idle')return;status='guides';render();}
function transmit(){clearTimeout(timer);clearTimeout(advanceTimer);status='transmitting';render();timer=setTimeout(()=>{if(status!=='transmitting')return;signal=scenario;status='result';render();advanceTimer=setTimeout(()=>{if(status==='result')showGuides();},3300);},1450);}
function activate(){if(status!=='idle')return;previousFocus=document.activeElement;scenario=document.getElementById('sos-link-scenario')?.value==='lost'?'lost':'received';selectedGuide=null;stopVoice();setAlarm(true);transmit();}
function finish(){clearTimeout(timer);clearTimeout(advanceTimer);stopVoice();setAlarm(false);status='idle';selectedGuide=null;render();previousFocus?.focus?.({preventScroll:true});}
function retry(){if(status==='idle')return;transmit();}
function readGuide(){const g=guides.find(x=>x.id===selectedGuide);if(!g||!('speechSynthesis'in window)){toast('Speech playback unavailable. The text guide is still accessible.');return;}stopVoice();speechSynthesis.cancel();const text=[g.label,g.first,...g.steps.flatMap(([title,body],i)=>[`Step ${i+1}. ${title}. ${body}`])].join(' ');const utterance=new SpeechSynthesisUtterance(text);utterance.lang='en-US';utterance.rate=.93;speechSynthesis.speak(utterance);}
export function initializeSOS(onNotify=()=>{}){
 toast=onNotify;root=document.getElementById('sos-root');if(!root){root=document.createElement('div');root.id='sos-root';document.body.append(root);}
 document.addEventListener('click',e=>{const target=e.target.closest?.('[data-sos-action]');if(!target)return;const action=target.dataset.sosAction;if(action==='trigger')activate();else if(action==='guides')showGuides();else if(action==='end')finish();else if(action==='retry')retry();else if(action==='issue'){selectedGuide=target.dataset.guide;render();}else if(action==='back'){selectedGuide=null;render();}else if(action==='toggle-alarm'){setAlarm(!alarmOn);render();}else if(action==='voice-home')toggleVoice('home');else if(action==='voice-guide')toggleVoice('guide');else if(action==='read')readGuide();});
 document.addEventListener('change',e=>{if(e.target.matches?.('[data-sos-scenario]'))scenario=e.target.value==='lost'?'lost':'received';});
 document.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&status!=='idle'){e.preventDefault();e.stopPropagation();if(selectedGuide){selectedGuide=null;render();}return;}
   if(e.key==='Tab'&&status!=='idle'){
     const controls=[...root.querySelectorAll('button,a[href],input,select')].filter(el=>!el.disabled&&el.getClientRects().length);if(!controls.length)return;
     const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
   }
   if(e.code!=='Space'||e.repeat||status!=='idle'||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey)return;
   if(e.target.closest?.('input,textarea,select,button,a,[contenteditable="true"],[role="button"]'))return;
   if(document.querySelector('.dialog-backdrop,.appearance-panel'))return;
   e.preventDefault();activate();
 },true);
 window.addEventListener('pagehide',()=>{clearTimeout(timer);clearTimeout(advanceTimer);stopVoice();setAlarm(false);});
}
