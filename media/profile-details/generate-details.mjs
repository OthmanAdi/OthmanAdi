import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Original, dependency-free SVG artwork. No external resources or brand logos.
const out = dirname(fileURLToPath(import.meta.url));
const sans = "'Segoe UI', Arial, sans-serif";
const serif = "Georgia, 'Times New Roman', serif";
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const themes = {
  light: { bg:'#f6f3ed', quote:'#faf7f0', paper:'#fffefb', ink:'#23352e', muted:'#58675f', accent:'#377c67', rule:'#dcdfd5', soft:'#dce7dd', line:'#adc0b2' },
  dark: { bg:'#1c2420', quote:'#222923', paper:'#28342c', ink:'#f3f2e9', muted:'#b6c6bc', accent:'#8fc7ae', rule:'#435249', soft:'#304a3b', line:'#627e6d' },
};
const text=(x,y,s,size,c,extra='')=>`<text x="${x}" y="${y}" fill="${c}" font-family="${sans}" font-size="${size}" ${extra}>${esc(s)}</text>`;
const path=(d,c,w=3,extra='')=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const rect=(x,y,w,h,c,stroke,r=5)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}" stroke="${stroke}" stroke-width="3"/>`;
const circle=(x,y,r,c,stroke,w=3)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${stroke}" stroke-width="${w}"/>`;
const svg=(w,h,title,desc,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc>${body}</svg>\n`;

const references = [
  { id:'berlitz', institution:'BERLITZ', name:'Heike Ehle', affiliation:'Berlitz Deutschland GmbH', date:'März 2024',
    desktop:{ size:38, start:130, step:49, lines:['„Herr Adi unterrichtet seine','SchülerInnen mit außerordentlichem','Erfolg.“'] },
    mobile:{ height:372, start:108, step:38, rule:224, lines:['„Herr Adi unterrichtet seine','SchülerInnen mit','außerordentlichem Erfolg.“'] } },
  { id:'startsteps', institution:'STARTSTEPS', name:'Dominik Baedorf', affiliation:'StartSteps', date:'28. November 2023',
    desktop:{ size:34, start:109, step:42, lines:['„Seine Unterrichtsorganisation','und Classroom Management sind','strukturiert und stets auf den','bestmöglichen Lernerfolg unserer','Teilnehmenden ausgerichtet.“'] },
    mobile:{ height:460, size:28, start:100, step:35, rule:312, lines:['„Seine Unterrichtsorganisation','und Classroom Management','sind strukturiert und stets','auf den bestmöglichen','Lernerfolg unserer','Teilnehmenden ausgerichtet.“'] } },
  { id:'mindrefined', institution:'MINDREFINED', name:'David Oesinghaus', affiliation:'MindRefined', date:'2. Februar 2024',
    desktop:{ size:37, start:130, step:49, lines:['„Sein Unterrichtsstil war klar','strukturiert, interaktiv und an die','Bedürfnisse der Lernenden angepasst.“'] },
    mobile:{ height:410, start:108, step:38, rule:262, lines:['„Sein Unterrichtsstil war','klar strukturiert, interaktiv','und an die Bedürfnisse der','Lernenden angepasst.“'] } },
];

const tiles=[
  {id:'plandeck',name:'Plandeck',purpose:'Visual dependency-aware planning for agent work.',draw:c=>
    path('M136 47H154Q162 47 162 57V78H180M136 91H154Q162 91 162 81V78',c.accent)+rect(108,34,28,26,c.paper,c.line,4)+rect(108,78,28,26,c.paper,c.line,4)+rect(181,62,36,32,c.soft,c.accent,4)+path('M190 73H207M190 82H202',c.accent,2.5)},
  {id:'chronos',name:'chronos',purpose:'Time awareness for coding agents from their session records.',draw:c=>
    path('M184 42A34 34 0 1 1 139 39',c.accent,3.5)+path('M177 40L186 42L184 32',c.accent,3.5)+path('M160 46V68L178 80',c.ink,3.5)+circle(160,68,3,c.accent,c.accent,1)},
  {id:'stateassure',name:'StateAssure',purpose:'Inspect Windows filesystem metadata and scan coverage.',draw:c=>
    `<path d="M108 47V37Q108 32 113 32H137L146 43H177Q182 43 182 48V87Q182 92 177 92H113Q108 92 108 87Z" fill="${c.soft}" stroke="${c.accent}" stroke-width="3"/>`+circle(181,78,22,c.paper,c.accent,3.5)+path('M197 94L215 112',c.accent,7)+path('M171 72H191M171 81H186',c.line,3)},
  {id:'skill-deck',name:'Skill Deck',purpose:'Discover, search and manually review AI-agent artifacts.',draw:c=>
    `<g transform="rotate(-12 154 73)">${rect(118,34,57,76,c.soft,c.line,5)}</g><g transform="rotate(12 168 73)">${rect(143,34,57,76,c.soft,c.line,5)}</g>`+rect(132,31,57,76,c.paper,c.accent,5)+path('M145 49H175M145 62H175M145 75H168M145 88H172',c.line,3)},
  {id:'index',name:'INDEX',purpose:'Local governance and risk classification for agent artifacts.',draw:c=>
    rect(112,37,96,69,c.paper,c.accent,5)+`<path d="M118 37V27H141L148 37M153 37V27H176L183 37" fill="${c.soft}" stroke="${c.accent}" stroke-width="3"/>`+circle(129,55,4,c.accent,c.accent,1)+circle(129,72,4,c.paper,c.accent,2)+circle(129,89,4,c.paper,c.accent,2)+path('M143 55H191M143 72H183M143 89H188',c.line,3)},
  {id:'bunbite',name:'BunBite',purpose:'Local-first image optimization for WebP, JPEG and PNG.',draw:c=>
    rect(111,31,98,76,c.paper,c.accent,6)+circle(181,51,7,c.soft,c.line,2)+path('M121 94L145 65L162 84L176 72L199 94Z',c.accent,3)+path('M103 51H115M110 46L115 51L110 56M217 87H205M210 82L205 87L210 92',c.ink,2.5)},
  {id:'loophole',name:'Loophole',purpose:'Ableton Live control through an extension kit and MCP server.',draw:c=>
    path('M188 47A35 35 0 1 0 189 92',c.accent,3.5)+path('M182 47H190V39M182 92H190V100',c.accent,3.5)+path('M112 69H133L142 49L153 89L164 54L175 78L184 68H212',c.ink,3)},
  {id:'openui-forge',name:'OpenUI Forge',purpose:'An agent skill for building interfaces with OpenUI.',draw:c=>
    path('M119 35H110V105H119M201 35H210V105H201',c.accent,3.5)+rect(125,36,70,20,c.soft,c.line,3)+rect(125,65,28,38,c.paper,c.accent,3)+rect(162,65,33,15,c.paper,c.line,3)+rect(162,89,33,14,c.paper,c.line,3)},
  {id:'openmark',name:'OpenMark',purpose:'A knowledge graph for bookmark collections.',draw:c=>
    path('M134 48L160 63L189 45M130 93L159 78L191 96',c.line,3)+circle(124,42,10,c.paper,c.accent)+circle(199,38,10,c.paper,c.accent)+circle(121,100,10,c.paper,c.accent)+circle(202,102,10,c.paper,c.accent)+`<path d="M145 42H176V98L160.5 88L145 98Z" fill="${c.soft}" stroke="${c.accent}" stroke-width="3"/>`},
  {id:'langsmith-fetch',name:'LangSmith Fetch',purpose:'Retrieve LangChain and LangGraph traces in the terminal.',draw:c=>
    path('M113 36V95H127M113 55H129M113 75H143',c.line,3)+rect(128,30,78,13,c.soft,c.accent,3)+rect(130,50,61,13,c.paper,c.line,3)+rect(145,70,47,13,c.paper,c.line,3)+path('M209 74V108M201 100L209 108L217 100',c.accent,3.5)},
];

const manifest={references:[],tiles:[],tileDisplay:{width:104,height:75.4,nameSize:13},mobileReferenceDisplay:{width:223,bodySizeMinimum:28*223/440,bodySizeMaximum:30*223/440,authorSize:30*223/440,metadataSize:24*223/440}};
for(const [theme,c]of Object.entries(themes)){
  for(const q of references){
    const quote=q.desktop.lines.join(' ');
    if(q.mobile.lines.join(' ')!==quote)throw new Error(`Quote line-wrap mismatch: ${q.id}`);
    const source=`${q.name}, ${q.affiliation}, ${q.date}`;
    const desktop=svg(820,430,source,`Exact German excerpt from a historical institutional reference letter: ${quote}`,
      `<rect x=".75" y=".75" width="818.5" height="428.5" rx="5" fill="${c.quote}" stroke="${c.rule}" stroke-width="1.5"/><rect x=".75" y=".75" width="5" height="428.5" fill="${c.accent}"/>`+
      text(43,49,q.institution,22,c.muted,'font-weight="600" letter-spacing="2.5"')+
      `<g class="quotation" fill="${c.ink}" font-family="${serif}" font-size="${q.desktop.size}">${q.desktop.lines.map((s,i)=>`<text x="43" y="${q.desktop.start+i*q.desktop.step}">${esc(s)}</text>`).join('')}</g>`+
      path('M44 320H774',c.rule,1)+text(43,361,q.name,29,c.ink,'font-weight="600"')+text(43,397,`${q.affiliation} · ${q.date}`,23,c.muted));
    const m=q.mobile;
    const mobile=svg(440,m.height,source,`Exact German excerpt from a historical institutional reference letter: ${quote}`,
      `<rect x=".75" y=".75" width="438.5" height="${m.height-1.5}" rx="4" fill="${c.quote}" stroke="${c.rule}" stroke-width="1.5"/><rect x=".75" y=".75" width="4" height="${m.height-1.5}" fill="${c.accent}"/>`+
      text(28,46,q.institution,26,c.muted,'font-weight="600" letter-spacing="1.2"')+
      `<g class="quotation" fill="${c.ink}" font-family="${serif}" font-size="${m.size??30}">${m.lines.map((s,i)=>`<text x="28" y="${m.start+i*m.step}">${esc(s)}</text>`).join('')}</g>`+
      path(`M28 ${m.rule}H411`,c.rule,1)+text(28,m.rule+40,q.name,30,c.ink,'font-weight="600"')+text(28,m.rule+82,q.affiliation,24,c.muted)+text(28,m.rule+116,q.date,24,c.muted));
    for(const [suffix,data,width,height]of [['',desktop,820,430],['-mobile',mobile,440,m.height]]){
      const filename=`reference-${q.id}${suffix}-${theme}.svg`;
      writeFileSync(join(out,filename),data);
      manifest.references.push({filename,width,height});
    }
  }
  for(const p of tiles){
    const filename=`tile-${p.id}-${theme}.svg`;
    const label=p.id==='langsmith-fetch'
      ?text(160,168,'LangSmith',40,c.ink,'font-weight="600" text-anchor="middle"')+text(160,212,'Fetch',40,c.ink,'font-weight="600" text-anchor="middle"')
      :text(160,201,p.name,40,c.ink,'font-weight="600" text-anchor="middle"');
    const content=svg(320,232,p.name,p.purpose,`<rect x=".75" y=".75" width="318.5" height="230.5" rx="12" fill="${c.bg}" stroke="${c.rule}" stroke-width="1.5"/>${p.draw(c)}${label}`);
    writeFileSync(join(out,filename),content);
    manifest.tiles.push({filename,width:320,height:232,purpose:p.purpose});
  }
}
writeFileSync(join(out,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
