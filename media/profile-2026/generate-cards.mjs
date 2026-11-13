import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Original, dependency-free SVG illustrations. All artwork is schematic.
const out = dirname(fileURLToPath(import.meta.url));
const sans = "'Segoe UI', Arial, sans-serif";
const serif = "Georgia, 'Times New Roman', serif";
const mono = "Consolas, 'Liberation Mono', monospace";
const themes = {
  light: { bg:'#f6f3ed', paper:'#fffefb', ink:'#23352e', muted:'#58675f', accent:'#377c67', rule:'#dcdfd5', soft:'#dce7dd', line:'#adc0b2', fold:'#e7ede4', red:'#b76350', gold:'#a7834d', shadow:'#172b20', quote:'#faf7f0' },
  dark: { bg:'#1c2420', paper:'#28342c', ink:'#f3f2e9', muted:'#b6c6bc', accent:'#8fc7ae', rule:'#435249', soft:'#304a3b', line:'#627e6d', fold:'#395341', red:'#d68b73', gold:'#d1b078', shadow:'#000000', quote:'#222923' },
};
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const text = (x,y,s,size=24,color='currentColor',extra='') => `<text x="${x}" y="${y}" fill="${color}" font-family="${sans}" font-size="${size}" ${extra}>${esc(s)}</text>`;
const line = (d,c,width=2,extra='') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const sheet = (x,y,w,h,c) => `<rect x="${x+5}" y="${y+6}" width="${w}" height="${h}" rx="8" fill="${c.shadow}" opacity=".07"/><path d="M${x+8} ${y}H${x+w-22}L${x+w} ${y+22}V${y+h-8}Q${x+w} ${y+h} ${x+w-8} ${y+h}H${x+8}Q${x} ${y+h} ${x} ${y+h-8}V${y+8}Q${x} ${y} ${x+8} ${y}Z" fill="${c.paper}" stroke="${c.rule}" stroke-width="2"/><path d="M${x+w-22} ${y}V${y+15}Q${x+w-22} ${y+22} ${x+w-15} ${y+22}H${x+w}" fill="${c.fold}" stroke="${c.rule}" stroke-width="2"/>`;

function pwf(c) {
  let s='';
  for (const [i,name] of ['task_plan.md','findings.md','progress.md'].entries()) {
    const x=49+i*246, y=155+(i===1?-8:0);
    s+=sheet(x,y,226,148,c)+line(`M${x+18} ${y+27}H${x+170}`,c.accent,4)+line(`M${x+18} ${y+40}H${x+111}`,c.line,3);
    s+=line(`M${x+17} ${y+55}H${x+207}`,c.rule);
    for(let j=0;j<3;j++){
      const yy=y+77+j*22;
      if(i===0)s+=`<rect x="${x+18}" y="${yy-6}" width="11" height="11" rx="2" fill="none" stroke="${c.accent}" stroke-width="2"/>`;
      if(i===2)s+=`<circle cx="${x+24}" cy="${yy}" r="4.5" fill="none" stroke="${c.accent}" stroke-width="2"/>`;
      s+=line(`M${x+(i===1?20:41)} ${yy}H${x+190-(j===1?21:0)}`,c.line,4);
    }
  }
  s+=line('M654 315V325Q654 334 644 334H174Q164 334 164 325V316',c.accent,2);
  s+=line('M158 322L164 316L170 322',c.accent,2);
  return s;
}
function zero(c) {
  let s='';
  const paths=[
    'M50 231C113 151 204 141 283 174S427 246 527 190S693 135 772 193',
    'M50 251C111 173 204 161 277 190S425 269 536 208S704 157 771 213',
    'M50 274C126 190 208 185 278 209S426 291 545 230S710 181 771 233',
    'M50 298C137 215 212 204 286 230S430 314 554 250S718 204 771 257',
    'M75 320C157 245 224 230 297 252S438 337 564 275S725 229 771 281',
  ];
  for(const p of paths)s+=line(p,c.line,1.4,'opacity=".52"');
  s+=line('M119 286C201 286 206 219 296 221S426 303 497 248S557 184 632 191',c.accent,4,'stroke-dasharray="7 10"');
  for(const [x,y] of [[119,286],[296,221],[497,248]])s+=`<circle cx="${x}" cy="${y}" r="10" fill="${c.bg}" stroke="${c.accent}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="3" fill="${c.accent}"/>`;
  s+=`<ellipse cx="632" cy="213" rx="25" ry="7" fill="${c.shadow}" opacity=".13"/><path d="M632 209C624 194 607 182 607 167A25 25 0 0 1 657 167C657 182 640 194 632 209Z" fill="${c.red}"/><circle cx="632" cy="167" r="9" fill="${c.paper}"/>`;
  return s;
}
function bookshelf(c,theme) {
  const colors=theme==='light'?['#627e6d','#bd8264','#768b94','#d7bf83','#667b6b','#b29b86','#8d6d69']:['#577b63','#ad7258','#5c7a8c','#b59b60','#4e765d','#9c8874','#9b706a'];
  let s=`<rect x="48" y="306" width="722" height="14" rx="3" fill="${c.gold}" opacity=".55"/><path d="M48 320H770L752 333H66Z" fill="${c.gold}" opacity=".26"/>`;
  const books=[[78,182,68,124],[151,151,78,155],[235,170,62,136],[303,146,76,160],[386,187,88,119],[480,160,73,146]];
  for(const [i,[x,y,w,h]] of books.entries()){
    s+=`<rect x="${x+3}" y="${y+3}" width="${w}" height="${h}" rx="5" fill="${c.shadow}" opacity=".1"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="5" fill="${colors[i]}"/><path d="M${x+8} ${y+3}V${y+h-3}" stroke="${c.paper}" opacity=".2" stroke-width="2"/>`;
    s+=line(`M${x+17} ${y+18}H${x+w-12}M${x+17} ${y+23}H${x+w-12}M${x+15} ${y+h-17}H${x+w-12}`,c.paper,2,'opacity=".5"');
    if(i===1||i===4)s+=`<path d="M${x+w-27} ${y}V${y+43}L${x+w-19} ${y+36}L${x+w-11} ${y+43}V${y}Z" fill="${c.paper}" opacity=".65"/>`;
  }
  s+=`<g transform="rotate(-13 610 306)"><rect x="589" y="157" width="70" height="149" rx="5" fill="${colors[6]}"/>${line('M601 161V301',c.paper,2,'opacity=".25"')}${line('M611 177H647M611 182H647M607 285H647',c.paper,2,'opacity=".55"')}</g>`;
  s+=`<path d="M692 275V306H737" fill="none" stroke="${c.accent}" stroke-width="8" stroke-linecap="round"/>`;
  return s;
}
function sketchy(c) {
  let s=`<path d="M100 158L488 150L500 313L108 321Z" fill="${c.shadow}" opacity=".08"/><path d="M93 149L482 143L491 307L100 314Z" fill="${c.paper}" stroke="${c.ink}" stroke-width="1.5"/><path d="M96 152L479 146L488 305L102 311Z" fill="none" stroke="${c.ink}" opacity=".25"/>`;
  for(let i=0;i<6;i++)s+=`<path d="M${118+i*58} 145C${105+i*58} 121 ${139+i*58} 122 ${132+i*58} 147" fill="none" stroke="${c.muted}" stroke-width="2.5"/>`;
  s+=line('M125 184L211 182M125 190L176 189',c.line,2);
  s+=line('M126 278L127 219L181 220L183 279M194 277L196 238L247 237L248 277M261 277L263 206L314 207L316 277',c.accent,2.7);
  s+=line('M122 281L324 280',c.ink,1.8);
  s+=`<path d="M355 217C356 189 416 187 420 216C423 245 360 247 355 217Z" fill="none" stroke="${c.red}" stroke-width="2.6"/>`;
  s+=line('M362 257C378 264 399 262 416 254M408 251L418 253L413 263',c.ink,2);
  s+=`<g transform="rotate(29 604 222)"><rect x="591" y="133" width="25" height="163" rx="2" fill="${c.gold}"/><rect x="591" y="134" width="7" height="160" fill="${c.paper}" opacity=".3"/><path d="M591 296L603.5 325L616 296Z" fill="${c.line}"/><path d="M600 317L603.5 325L607 317Z" fill="${c.ink}"/><rect x="591" y="126" width="25" height="17" rx="3" fill="${c.red}"/><rect x="591" y="144" width="25" height="9" fill="${c.muted}"/></g>`;
  s+=line('M686 248C705 222 728 263 745 238M685 263C707 242 727 281 748 257',c.line,2.5);
  return s;
}
function plandeck(c) {
  let s=`<rect x="47" y="152" width="225" height="174" rx="8" fill="${c.soft}" opacity=".35"/><rect x="296" y="152" width="225" height="174" rx="8" fill="${c.soft}" opacity=".35"/><rect x="545" y="152" width="225" height="174" rx="8" fill="${c.soft}" opacity=".35"/>`;
  s+=line('M237 218H278Q289 218 289 230V251H328M237 287H278Q289 287 289 275V251',c.line,2.5);
  s+=line('M487 251H570M560 245L570 251L560 257',c.accent,2.5);
  for(const [x,y,w] of [[66,199,171],[66,268,171],[328,224,159]]){
    s+=`<rect x="${x}" y="${y}" width="${w}" height="44" rx="6" fill="${c.paper}" stroke="${c.rule}" stroke-width="2"/><circle cx="${x+17}" cy="${y+22}" r="5" fill="none" stroke="${c.accent}" stroke-width="2"/>`;
    s+=line(`M${x+35} ${y+17}H${x+w-19}M${x+35} ${y+28}H${x+w-43}`,c.line,3);
  }
  s+=`<rect x="574" y="215" width="177" height="69" rx="7" fill="${c.paper}" stroke="${c.accent}" stroke-width="2.5"/><path d="M588 228H591V272H588Z" fill="${c.accent}"/>`;
  s+=line('M607 237H732M607 252H715M607 267H687',c.line,4);
  return s;
}
function stateassure(c) {
  let s=line('M111 181V296M111 219H171M111 283H171M252 219H332M252 283H332',c.line,2.5);
  const folder=(x,y)=>`<path d="M${x} ${y+7}Q${x} ${y} ${x+7} ${y}H${x+31}L${x+41} ${y+9}H${x+74}Q${x+80} ${y+9} ${x+80} ${y+16}V${y+43}Q${x+80} ${y+50} ${x+73} ${y+50}H${x+7}Q${x} ${y+50} ${x} ${y+43}Z" fill="${c.soft}" stroke="${c.accent}" stroke-width="2"/>`;
  s+=folder(72,147)+folder(172,194)+folder(172,258);
  s+=sheet(333,192,62,54,c)+sheet(333,256,62,54,c);
  s+=line('M344 219H383M344 231H372M344 283H383M344 295H372',c.line,3);
  s+=line('M406 249H501',c.line,2,'stroke-dasharray="3 7"');
  s+=`<circle cx="594" cy="225" r="75" fill="${c.paper}" stroke="${c.accent}" stroke-width="5"/><circle cx="594" cy="225" r="66" fill="none" stroke="${c.rule}" stroke-width="1.5"/>`;
  s+=line('M647 280L698 329',c.accent,15);
  s+=line('M549 201H582M549 228H575M549 255H579',c.muted,4);
  s+=line('M604 201H635M604 228H626M604 255H638',c.line,4);
  return s;
}

const projects=[
  {id:'pwf',name:'Planning with Files',purpose:'A persistent working record for coding agents.',type:'Markdown · Agent skill',draw:pwf},
  {id:'zero-to',name:'zero-to',purpose:'Learning roadmaps you can walk through.',type:'TypeScript · Learning roadmaps',draw:zero},
  {id:'bookshelf',name:'Bookmark Bookshelf',purpose:'Saved links, arranged as books.',type:'TypeScript · Local-first reading',draw:bookshelf},
  {id:'sketchy',name:'sketchy',purpose:'Hand-drawn explanations from plain HTML.',type:'Agent skill · HTML / PDF / PPTX / MP4',draw:sketchy},
  {id:'plandeck',name:'Plandeck',purpose:'Dependencies, ready tasks, and the next action.',type:'JavaScript · Plans stored as YAML',draw:plandeck},
  {id:'stateassure',name:'StateAssure',purpose:'Inspect Windows filesystem metadata.',type:'C++20 · Windows CLI',draw:stateassure},
];

const quotes=[
  {id:'berlitz',institution:'BERLITZ',name:'Heike Ehle',date:'Berlitz Deutschland GmbH · März 2024',size:38,start:130,step:49,lines:['„Herr Adi unterrichtet seine','SchülerInnen mit außerordentlichem','Erfolg.“']},
  {id:'startsteps',institution:'STARTSTEPS',name:'Dominik Baedorf',date:'StartSteps · 28. November 2023',size:34,start:109,step:42,lines:['„Seine Unterrichtsorganisation','und Classroom Management sind','strukturiert und stets auf den','bestmöglichen Lernerfolg unserer','Teilnehmenden ausgerichtet.“']},
  {id:'mindrefined',institution:'MINDREFINED',name:'David Oesinghaus',date:'MindRefined · 2. Februar 2024',size:37,start:130,step:49,lines:['„Sein Unterrichtsstil war klar','strukturiert, interaktiv und an die','Bedürfnisse der Lernenden angepasst.“']},
];
const files=[];
function save(name,svg){writeFileSync(join(out,name),svg);files.push(name)}
for(const [theme,c]of Object.entries(themes)){
  for(const p of projects){
    save(`card-${p.id}-${theme}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="820" height="330" viewBox="0 0 820 330" role="img" aria-labelledby="title desc"><title id="title">${esc(p.name)} — ${esc(p.purpose)}</title><desc id="desc">${esc(p.type)}. Original schematic project illustration; no live results or measured outcomes are depicted. Purpose and technical details are provided as native Markdown beside this image.</desc><rect x=".75" y=".75" width="818.5" height="328.5" rx="18" fill="${c.bg}" stroke="${c.rule}" stroke-width="1.5"/>${text(43,69,p.name,56,c.ink,'font-weight="600" letter-spacing="-.8"')}<g transform="translate(0 -27)">${p.draw(c,theme)}</g></svg>\n`);
  }
  for(const q of quotes){
    const quote=q.lines.join(' ');
    save(`quote-${q.id}-${theme}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="820" height="430" viewBox="0 0 820 430" role="img" aria-labelledby="title desc"><title id="title">${esc(q.name)} · ${esc(q.date)}</title><desc id="desc">Exact German excerpt from a historical institutional reference letter: ${esc(quote)}</desc><rect x=".75" y=".75" width="818.5" height="428.5" rx="5" fill="${c.quote}" stroke="${c.rule}" stroke-width="1.5"/><rect x=".75" y=".75" width="5" height="428.5" fill="${c.accent}"/>${text(43,49,q.institution,22,c.muted,'font-weight="600" letter-spacing="2.5"')}<g fill="${c.ink}" font-family="${serif}" font-size="${q.size}">${q.lines.map((s,i)=>`<text x="43" y="${q.start+i*q.step}">${esc(s)}</text>`).join('')}</g>${line('M44 320H774',c.rule,1)}${text(43,361,q.name,29,c.ink,'font-weight="600"')}${text(43,397,q.date,23,c.muted)}</svg>\n`);
  }
}
mkdirSync(join(out,'validation'),{recursive:true});
for(const [theme,c]of Object.entries(themes)){
  const cards=files.filter(f=>f.endsWith(`-${theme}.svg`));
  for(const width of [410,375,278,223]){
    const html=`<!doctype html><html><head><meta charset="utf-8"><title>Shared profile cards ${theme} ${width}px QA</title><style>body{margin:0;padding:20px;background:${theme==='light'?'#ffffff':'#101713'};display:grid;grid-template-columns:repeat(2,${width}px);gap:16px;font:14px Arial;color:${c.ink}}figure{margin:0}img{display:block;width:${width}px;max-width:100%;height:auto}figcaption{padding:5px 0 0}</style></head><body>${cards.map(f=>`<figure><img src="../${f}" alt="${f}"><figcaption>${f}</figcaption></figure>`).join('')}</body></html>`;
    writeFileSync(join(out,'validation',`${theme}-${width}.html`),html);
  }
}
writeFileSync(join(out,'manifest.json'),JSON.stringify({width:820,projectHeight:330,quoteHeight:430,projectTitleSize:56,minimumReviewedDisplayWidth:223,files,quoteSource:'../teaching-leadership-evidence.md'},null,2)+'\n');
