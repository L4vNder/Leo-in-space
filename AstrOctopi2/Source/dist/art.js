/* Original AstrOctopi vector artwork. No remote assets or dependencies. */
export const HATS = [
  {id:'none',label:'No hat'}, {id:'cowboy',label:'Space cowboy'},
  {id:'astronaut',label:'Astronaut'}, {id:'crown',label:'Little royalty'},
  {id:'beanie',label:'Cozy beanie'}, {id:'beret',label:'Artist beret'},
  {id:'wizard',label:'Star wizard'}, {id:'sailor',label:'Sailor cap'},
  {id:'party',label:'Party time'}, {id:'sunhat',label:'Sunny explorer'},
  {id:'headphones',label:'Headphones'}
];
export const ACCESSORIES = [
  {id:'none',label:'No accessory'}, {id:'guitar',label:'Tiny guitar'},
  {id:'monocle',label:'Monocle'}, {id:'scooter',label:'Moon scooter'},
  {id:'book',label:'Good book'}, {id:'star',label:'Lucky star'},
  {id:'camera',label:'Camera'}, {id:'flower',label:'Little flower'},
  {id:'scarf',label:'Cozy scarf'}, {id:'flag',label:'Mission flag'},
  {id:'tea',label:'Cup of tea'}
];
export const COLORS = [
  {hex:'#9aa9ee',name:'Moon lavender'}, {hex:'#9fd8d1',name:'Seafoam'},
  {hex:'#f3b6c6',name:'Cosmic rose'}, {hex:'#f3d98a',name:'Butter yellow'},
  {hex:'#99caea',name:'Glacier blue'}, {hex:'#cfb5e8',name:'Lilac'},
  {hex:'#eebd9f',name:'Peach nebula'}, {hex:'#b6d6ab',name:'Sage'}
];
const esc = v => String(v).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let serial = 0;
const mix = (hex,target,t) => '#'+[0,2,4].map(i=>Math.round(parseInt(hex.slice(1+i,3+i),16)*(1-t)+target*t).toString(16).padStart(2,'0')).join('');

export function octopus({color='#9aa9ee',hat='none',accessory='none',mood='happy',size=300,name='Orbit'}={}) {
  if(!/^#[\da-f]{6}$/i.test(color)) color='#9aa9ee';
  size = Math.max(24,Math.min(1200,Number(size)||300));
  const id='octo'+(++serial), dark=mix(color,55,.28), light=mix(color,255,.38);
  const stroke='#36415a';
  const hats = {
    none:'',
    cowboy:`<g stroke="${stroke}" stroke-width="3" stroke-linejoin="round"><path d="M87 98q-12-10-27-1-4 13 30 16h140q34-3 29-16-15-9-28 1l-17-48q-10-7-28 3-25 9-47-1-13-8-25-1Z" fill="#d8ab78"/><path d="M106 85q54 18 113 0l5 16q-60 17-123 0Z" fill="#a56d51"/><path d="m154 91 5-7 5 7 8 1-6 6 2 8-9-4-8 4 2-8-6-6Z" fill="#ffe398" stroke="none"/></g>`,
    astronaut:`<g fill="none" stroke-linejoin="round"><path d="M70 156q-4-86 88-96 94 4 95 96l-6 40q-8 18-29 24H100q-23-7-28-26Z" fill="#edf6ff" fill-opacity=".18" stroke="#e9f6ff" stroke-width="12"/><path d="M80 141q1-57 57-69" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/><path d="M76 193q84 29 169-1" stroke="#7187ad" stroke-width="7"/><rect x="57" y="139" width="19" height="42" rx="8" fill="#dce9f3" stroke="#70829e" stroke-width="3"/><rect x="245" y="139" width="19" height="42" rx="8" fill="#dce9f3" stroke="#70829e" stroke-width="3"/><circle cx="255" cy="152" r="3" fill="#f4cf75"/></g>`,
    crown:`<g stroke="${stroke}" stroke-width="3" stroke-linejoin="round"><path d="m111 99-8-47 29 18 27-35 28 35 30-18-9 47Z" fill="#f7d57e"/><path d="M110 91h100v15H110Z" fill="#edba65"/><circle cx="159" cy="79" r="6" fill="#dc92b5"/><circle cx="105" cy="50" r="5" fill="#fff0b8"/><circle cx="159" cy="33" r="5" fill="#fff0b8"/><circle cx="217" cy="50" r="5" fill="#fff0b8"/></g>`,
    beanie:`<g stroke="${stroke}" stroke-width="3"><path d="M98 100q1-57 62-58 61 1 62 58Z" fill="#e9a9b8"/><path d="M133 51q-9 24-7 46m34-50v50m27-44q11 20 9 44" fill="none" stroke="#c9879d"/><rect x="94" y="90" width="132" height="25" rx="11" fill="#f2c3cf"/><circle cx="160" cy="37" r="14" fill="#f2c3cf"/><path d="m149 99 11 0v9h-11Z" fill="#fff0c7" stroke="none"/></g>`,
    beret:`<g stroke="${stroke}" stroke-width="3"><path d="M91 91q-11-32 44-41 77-17 99 14 10 21-27 34Z" fill="#3e6d77"/><path d="M108 91q58-10 103-2l-5 16q-45-5-94 4Z" fill="#315965"/><path d="m165 49 7-13" stroke-width="7" stroke-linecap="round"/></g>`,
    wizard:`<g stroke="${stroke}" stroke-width="3" stroke-linejoin="round"><path d="M103 104q16-37 39-87 6-10 20-6-5 16 10 29l46 64Z" fill="#7882bc"/><ellipse cx="160" cy="105" rx="79" ry="13" fill="#8e99ce"/><path d="m142 63 3-8 4 7 9 1-7 5 1 9-7-5-8 3 3-8-5-6Z" fill="#ffe8a1" stroke="none"/><path d="m177 87 3-8 4 7 8 1-6 5 1 8-7-4-7 3 2-8-5-5Z" fill="#ffe8a1" stroke="none"/></g>`,
    sailor:`<g stroke="${stroke}" stroke-width="3" stroke-linejoin="round"><path d="M108 90 96 52q63-18 129 0l-12 38Z" fill="#fcfcf4"/><path d="M104 84q57-14 114 0v20q-61-12-114 0Z" fill="#52758d"/><path d="M160 56v22m-10-7q10 15 20 0m-10-17v-4m-7 12h14" fill="none" stroke="#52758d" stroke-linecap="round"/></g>`,
    party:`<g stroke="${stroke}" stroke-width="3" stroke-linejoin="round"><path d="m111 104 48-83 49 83Z" fill="#f2c385"/><path d="m135 62 59 15m-70 4 77 18" fill="none" stroke="#b1a6db" stroke-width="10"/><ellipse cx="160" cy="105" rx="53" ry="9" fill="#fbdda1"/><circle cx="159" cy="20" r="10" fill="#dba8c6"/></g>`,
    sunhat:`<g stroke="${stroke}" stroke-width="3"><ellipse cx="160" cy="102" rx="85" ry="17" fill="#ecd59d"/><path d="M107 94q1-50 53-50t54 50Z" fill="#f3dfae"/><path d="M108 79q51 12 104 0v16q-52 13-105 0Z" fill="#b6cfc0"/><path d="M181 87q6-15 19-9-1 14-17 13 11 7 20 4-5 16-20 2Z" fill="#e9aeba"/></g>`,
    headphones:`<g stroke="${stroke}" stroke-width="4" stroke-linejoin="round"><path d="M83 147q-7-77 77-79 80 1 78 79" fill="none" stroke="#465575" stroke-width="12"/><path d="M88 111q15-36 52-40" fill="none" stroke="#a7bee4" stroke-width="4"/><rect x="69" y="133" width="29" height="53" rx="13" fill="#8ea8c9"/><rect x="223" y="133" width="29" height="53" rx="13" fill="#8ea8c9"/><path d="M238 184q2 17-23 22" fill="none"/><circle cx="211" cy="206" r="5" fill="#f3d98a"/></g>`
  };
  const accessories = {
    none:'',
    guitar:`<g transform="translate(234 209) rotate(22)" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"><path d="M-8 13q-17-6-23 6-6 10 5 18-17 13-4 28 15 17 30 4 13-12 0-28 13-7 7-20-4-9-15-8Z" fill="#e7b67b"/><rect x="-8" y="-37" width="11" height="65" rx="3" fill="#b98568"/><rect x="-11" y="-45" width="17" height="19" rx="4" fill="#d6a578"/><circle cx="-8" cy="40" r="8" fill="#776c72"/><path d="M-8 54H1m-4-84v86" fill="none" stroke-width="1.5" stroke="#f5e9d0"/></g>`,
    monocle:`<g fill="none" stroke="#a88354" stroke-width="3"><circle cx="191" cy="166" r="20" fill="#fff" fill-opacity=".14"/><path d="M208 177q21 26 10 59"/><path d="m184 155 9-4" stroke="#fff" stroke-width="3" stroke-linecap="round"/></g>`,
    scooter:`<g stroke="${stroke}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M135 300h94l-12-71h-17" fill="none"/><path d="M127 296h89" stroke="#a7c9c8" stroke-width="12"/><circle cx="130" cy="310" r="12" fill="#5e6b81"/><circle cx="230" cy="310" r="12" fill="#5e6b81"/><circle cx="130" cy="310" r="5" fill="#dbe5ee" stroke="none"/><circle cx="230" cy="310" r="5" fill="#dbe5ee" stroke="none"/></g>`,
    book:`<g transform="translate(152 242) rotate(-6)" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"><path d="M0-11q-21-15-48-8v52q27-8 48 8 21-16 48-8v-52Q21-26 0-11Z" fill="#91b9bc"/><path d="M0-9q-20-12-42-7v43q25-5 42 8 17-13 42-8v-43Q20-21 0-9Z" fill="#fff7de"/><path d="M0-9v44m-34-40 23 5m-23 7 23 5m22-12 23-5m-23 17 23-5" fill="none" stroke="#c5bda8" stroke-width="2"/></g>`,
    star:`<g transform="translate(242 235) rotate(13)" stroke="#b08a52" stroke-width="3" stroke-linejoin="round"><path d="m0-31 10 21 24 4-18 17 4 24-20-12-22 12 5-24-18-17 25-4Z" fill="#ffe49c"/><path d="m-10-4-1 4m22-4-1 4" stroke="#735f57" stroke-linecap="round"/><path d="M-4 9q4 4 8 0" fill="none" stroke="#735f57" stroke-width="2"/></g>`,
    camera:`<g transform="translate(158 247)" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"><path d="m-34-19 12-1 6-10h28l7 10h15q8 0 8 8v36q0 8-8 8h-68q-8 0-8-8v-35q0-8 8-8Z" fill="#7f9cab"/><circle cx="0" cy="5" r="20" fill="#d5e7eb"/><circle cx="0" cy="5" r="12" fill="#576e86"/><circle cx="-4" cy="1" r="4" fill="#aac7d8" stroke="none"/><path d="M25-10h5" stroke="#f9e0a3" stroke-width="5"/></g>`,
    flower:`<g stroke="${stroke}" stroke-width="3" stroke-linejoin="round"><path d="M239 265q-1-33 14-57" fill="none" stroke="#6d9b82" stroke-width="5"/><path d="M244 241q-20-19-28-10 9 17 26 15Z" fill="#a3cbaa" stroke="#6d9b82"/><g transform="translate(256 201)" fill="#efb4c8" stroke="#c28ba8" stroke-width="2"><ellipse cy="-13" rx="9" ry="13"/><ellipse cx="13" cy="-4" rx="13" ry="9" transform="rotate(-15 13 -4)"/><ellipse cx="8" cy="11" rx="9" ry="13" transform="rotate(-35 8 11)"/><ellipse cx="-9" cy="10" rx="9" ry="13" transform="rotate(35 -9 10)"/><ellipse cx="-13" cy="-5" rx="13" ry="9"/><circle r="8" fill="#ffe19c"/></g></g>`,
    scarf:`<g stroke="${stroke}" stroke-width="3" stroke-linejoin="round"><path d="M108 207q52 22 104-2l-6 27q-50 23-98 0Z" fill="#eeb3a5"/><path d="m190 225 25 6-5 47-26-7Z" fill="#eeb3a5"/><path d="m109 215 98 9m-19 19 23 7m-25 9 24 7" stroke="#f9d4ba" stroke-width="6"/><path d="m185 272-2 7m10-6-1 7m10-5-1 7" fill="none"/></g>`,
    flag:`<g stroke="${stroke}" stroke-width="3" stroke-linejoin="round"><path d="M253 277V174" fill="none" stroke-width="5"/><path d="M255 177q19-12 39 0v40q-20-12-39 0Z" fill="#c6d8eb"/><path d="m274 183 3 8 9 1-7 6 2 9-7-5-8 4 2-8-6-7 9-1Z" fill="#fff0b8" stroke="none"/></g>`,
    tea:`<g transform="translate(233 251)" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"><path d="M15-18q26-7 23 10-2 13-21 9" fill="none" stroke-width="5"/><path d="M-24-22h43l-3 37q-16 14-36 0Z" fill="#fff1cf"/><path d="M-29 23h57" fill="none" stroke="#a6b9c7" stroke-width="5" stroke-linecap="round"/><path d="M-12-33q-8-8-2-16m18 16q-8-9-2-17" fill="none" stroke="#c0cbd7" stroke-linecap="round"/><path d="M3-21v19l8 4v9H-1V2l4-4" fill="#b5cfae" stroke-width="1.5"/></g>`
  };
  const face = mood==='sleepy'
    ? `<path d="M119 163q10 9 21 0m40 0q10 9 21 0" fill="none" stroke="${stroke}" stroke-width="5" stroke-linecap="round"/><path d="M150 187q10 6 20 0" fill="none" stroke="${stroke}" stroke-width="3" stroke-linecap="round"/><text x="244" y="93" fill="#8e9cba" font-size="23" font-family="sans-serif" font-weight="700">z</text><text x="263" y="66" fill="#a5b1cc" font-size="16" font-family="sans-serif">z</text>`
    : `<ellipse cx="128" cy="164" rx="7" ry="10" fill="${stroke}"/><ellipse cx="192" cy="164" rx="7" ry="10" fill="${stroke}"/><circle cx="130" cy="161" r="2.2" fill="white"/><circle cx="194" cy="161" r="2.2" fill="white"/><path d="M149 185q11 ${mood==='concerned'?'-7':'13'} 22 0" fill="none" stroke="${stroke}" stroke-width="3.5" stroke-linecap="round"/>`;
  return `<svg class="octopus-art" width="${size}" height="${Math.round(size*340/320)}" viewBox="0 0 320 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)}, your octopus companion"><defs><linearGradient id="${id}body" x1="0" x2=".65" y1="0" y2="1"><stop stop-color="${light}"/><stop offset=".58" stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient><linearGradient id="${id}arm" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${color}"/><stop offset="1" stop-color="${dark}"/></linearGradient></defs><ellipse cx="160" cy="315" rx="91" ry="9" fill="#27314d" opacity=".07"/><g stroke="${dark}" stroke-width="1.5" stroke-linejoin="round"><path d="M109 215q-35 2-42 24-11 24-28 10-6-7-12 1-11 16 6 29 31 22 54-5l36-28Z" fill="url(#${id}arm)"/><path d="M211 215q35 2 42 24 11 24 28 10 6-7 12 1 11 16-6 29-31 22-54-5l-36-28Z" fill="url(#${id}arm)"/><path d="M115 227q-34 24-31 47 1 16-14 12-14-5-18 6-3 13 14 17 38 10 49-28l22-40Z" fill="url(#${id}arm)"/><path d="M205 227q34 24 31 47-1 16 14 12 14-5 18 6 3 13-14 17-38 10-49-28l-22-40Z" fill="url(#${id}arm)"/><path d="M132 231q-17 22-17 47 0 20-12 16-10-6-14 3-5 13 10 18 30 9 39-26l17-52Z" fill="url(#${id}arm)"/><path d="M188 231q17 22 17 47 0 20 12 16 10-6 14 3 5 13-10 18-30 9-39-26l-17-52Z" fill="url(#${id}arm)"/><path d="M141 234q-10 31-5 53 5 14-6 12-11-2-12 8-1 13 16 13 22 1 25-32l4-51Z" fill="url(#${id}arm)"/><path d="M179 234q10 31 5 53-5 14 6 12 11-2 12 8 1 13-16 13-22 1-25-32l-4-51Z" fill="url(#${id}arm)"/></g><g fill="${light}" opacity=".7"><ellipse cx="62" cy="274" rx="5" ry="3" transform="rotate(-18 62 274)"/><ellipse cx="78" cy="259" rx="5" ry="3" transform="rotate(-40 78 259)"/><ellipse cx="258" cy="274" rx="5" ry="3" transform="rotate(18 258 274)"/><ellipse cx="242" cy="259" rx="5" ry="3" transform="rotate(40 242 259)"/><ellipse cx="109" cy="285" rx="3" ry="5"/><ellipse cx="137" cy="288" rx="3" ry="5"/><ellipse cx="183" cy="288" rx="3" ry="5"/><ellipse cx="211" cy="285" rx="3" ry="5"/></g><path d="M82 167q0-84 78-86 78 2 78 86 0 66-78 79-78-13-78-79Z" fill="url(#${id}body)"/><path d="M102 140q8-34 40-39" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".19"/><g fill="${dark}" opacity=".24"><ellipse cx="101" cy="178" rx="4" ry="3"/><circle cx="106" cy="192" r="4"/><circle cx="117" cy="202" r="3"/><ellipse cx="220" cy="178" rx="4" ry="3"/><circle cx="215" cy="192" r="4"/><circle cx="204" cy="202" r="3"/></g><ellipse cx="111" cy="181" rx="12" ry="6" fill="#ed9eae" opacity=".6"/><ellipse cx="209" cy="181" rx="12" ry="6" fill="#ed9eae" opacity=".6"/>${face}${hats[hat]||''}${accessories[accessory]||''}</svg>`;
}

const paths = {
  dashboard:'<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/><path d="m3 12 4 0 2-4 4 8 2-4h6"/>',
  moon:'<path d="M20.5 14A8.7 8.7 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/><path d="m18 3 .5 1.5L20 5l-1.5.5L18 7l-.5-1.5L16 5l1.5-.5Z"/>',
  food:'<path d="M4 3v6q0 3 3 3V3m3 0v6q0 3-3 3v9M19 21V3q-5 4-4 11h4"/>',
  exercise:'<path d="m7 5-2 2 12 12 2-2M5 3 3 5m18 14-2 2M3 7l4-4m14 14-4 4M9 7l-2 2m10 6-2 2"/>',
  brain:'<path d="M12 4q-3-4-6 0-4 0-3 5-4 4 0 7 0 5 5 4 4 3 4-2V4Zm0 0q3-4 6 0 4 0 3 5 4 4 0 7 0 5-5 4-4 3-4-2M6 4q-2 4 2 5M3 16q3-2 5 1m10-13q2 4-2 5m5 7q-3-2-5 1"/>',
  sparkles:'<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4M3 19v3m-1.5-1.5h3"/>',
  settings:'<path d="m9 3-.7 3-2.6 1.5-3-.7-1.5 2.6 2.3 2.1v3l-2.3 2.1L2.7 19l3-.7L8.3 20l.7 3h3l.7-3 2.6-1.7 3 .7 1.5-2.4-2.3-2.1v-3l2.3-2.1L18.3 7l-3 .7L12.7 6 12 3Z" transform="translate(1 -1) scale(.95)"/><circle cx="11" cy="12" r="3"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
  arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  water:'<path d="M12 3S5 11 5 15a7 7 0 0 0 14 0c0-4-7-12-7-12Z"/><path d="M8 15q0 4 4 4"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  logout:'<path d="M9 3H4v18h5m6-15 6 6-6 6M8 12h13"/>',
  activity:'<path d="M2 12h5l3-8 4 16 3-8h5"/>',
  crew:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m2-17a3 3 0 0 1 0 6m2 4a6 6 0 0 1 2 4v3"/>',
  shield:'<path d="m12 2 9 4v6q0 6-9 10-9-4-9-10V6Z"/><path d="m8 12 3 3 5-6"/>',
  search:'<circle cx="10.5" cy="10.5" r="7"/><path d="m16 16 5 5"/>',
  download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/>',
  alert:'<path d="m12 3 10 18H2Z"/><path d="M12 9v5m0 3v.1"/>'
};
export function icon(name,size=20){
  size=Math.max(10,Math.min(120,Number(size)||20));
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]||paths.sparkles}</svg>`;
}
