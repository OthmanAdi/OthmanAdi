"""Rebuild the self-contained footer SVGs. Requires fonttools[woff]==4.61.1.

Original drawing geometry, seeded pencil strokes and motion adaptation.
Typography: Caveat 600 and Courier Prime 700, converted to paths. See ATTRIBUTION.md.
"""
from pathlib import Path
import hashlib, html, json, math, random, re
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen

ROOT = Path(__file__).resolve().parent
W, H = 432, 600
FONTS = {}
for key, filename in [('hand','Caveat-latin.woff2'),('mono','CourierPrime-700-latin.woff2')]:
    f = TTFont(ROOT/'fonts'/filename)
    if 'fvar' in f:
        f = instantiateVariableFont(f, {'wght':600}, inplace=False)
    FONTS[key] = (f, f.getGlyphSet(), f.getBestCmap(), f['head'].unitsPerEm)

THEMES = {
 'light': dict(paper='#e8e4d9', stock='#f6f1e6', ink='#30382f', pencil='#4a5046', soft='#858875', moss='#70805a', green='#536d3d', orange='#ad7041', wash='#b7c19e', tape='#30352d', tapeInk='#faf4e5', fiber='#727663'),
 'dark': dict(paper='#242d26', stock='#343d31', ink='#f0e9d8', pencil='#d7dcc5', soft='#93a183', moss='#869a70', green='#b4c98d', orange='#dfad78', wash='#526846', tape='#181e18', tapeInk='#f6eedc', fiber='#a7ae8f'),
}

ITEMS = [
 ('plandeck','Plandeck',['Plandeck'],'Find the next ready task',['Find the next','ready task'],'clipboard','translate(0px, 8px)'),
 ('chronos','chronos',['chronos'],'Give agents time awareness',['Give agents','time awareness'],'clock','rotate(8deg)'),
 ('stateassure','StateAssure',['StateAssure'],'Find agent memory stores',['Find agent','memory stores'],'drawer','translate(7px, -3px)'),
 ('skill-deck','Skill Deck',['Skill Deck'],'Inspect local agent skills',['Inspect local','agent skills'],'cards','translate(0px, -8px)'),
 ('index','INDEX',['INDEX'],'Review agent artifact risks',['Review agent','artifact risks'],'binder','translate(6px, 0px)'),
 ('bunbite','BunBite',['BunBite'],'Shrink images. Stay local.',['Shrink images.','Stay local.'],'press','translate(0px, 8px)'),
 ('loophole','Loophole',['Loophole'],'Agent control for Ableton',['Agent control','for Ableton'],'piano','translate(0px, 5px)'),
 ('openui-forge','OpenUI Forge',['OpenUI','Forge'],'Integrate OpenUI into your app',['Integrate','OpenUI into','your app'],'fold','rotate(-4deg)'),
 ('openmark','OpenMark',['OpenMark'],'Connect bookmarks into a graph',['Connect','bookmarks into','a graph'],'linked','rotate(3deg)'),
 ('langsmith-fetch','LangSmith Fetch',['LangSmith','Fetch'],'Read traces. Debug agent runs.',['Read traces.','Debug agent runs.'],'receipt','translate(0px, 7px)'),
 ('haircut','haircut',['haircut'],'Trim agent context with undo',['Trim agent','context with undo'],'scissors','rotate(-8deg)'),
]

def num(v): return str(round(v,2)).rstrip('0').rstrip('.') if round(v,2)%1 else str(int(round(v)))
def seed(s): return int.from_bytes(hashlib.sha256(s.encode()).digest()[:8],'big')
def esc(s): return html.escape(s, quote=True)

class Pencil:
    def __init__(self, key, c):
        self.r=random.Random(seed(key)); self.c=c; self.parts=[]; self.defs=[]; self.n=0
    def line(self,x1,y1,x2,y2,color=None,width=4,opacity=.9):
        color=color or self.c['pencil']
        for j in range(2):
            a,b,d,e=[v+self.r.uniform(-1.25,1.25) for v in (x1,y1,x2,y2)]
            cx=(a+d)/2+self.r.uniform(-1.8,1.8); cy=(b+e)/2+self.r.uniform(-1.8,1.8)
            self.parts.append(f'<path d="M{num(a)} {num(b)}Q{num(cx)} {num(cy)} {num(d)} {num(e)}" fill="none" stroke="{color}" stroke-width="{num(width*(.8 if j else 1))}" opacity="{num(opacity*(.55 if j else 1))}" stroke-linecap="round"/>')
    def poly(self,pts,fill=None,hatch=False,color=None,width=4):
        color=color or self.c['pencil']; self.n+=1
        points=' '.join(f'{num(x)},{num(y)}' for x,y in pts)
        if fill:
            self.parts.append(f'<polygon points="{points}" fill="{fill}" opacity=".34"/>')
        if hatch:
            cid=f'h{self.n}'
            self.defs.append(f'<clipPath id="{cid}"><polygon points="{points}"/></clipPath>')
            x0=min(x for x,y in pts);x1=max(x for x,y in pts);y0=min(y for x,y in pts);y1=max(y for x,y in pts)
            self.parts.append(f'<g clip-path="url(#{cid})" opacity=".28">')
            for x in range(int(x0-(y1-y0)),int(x1+8),12):
                self.parts.append(f'<path d="M{x} {num(y1)}L{num(x+y1-y0)} {num(y0)}" stroke="{fill or color}" stroke-width="2.2"/>')
            self.parts.append('</g>')
        for j in range(2):
            jitter=[(x+self.r.uniform(-1.3,1.3),y+self.r.uniform(-1.3,1.3)) for x,y in pts]
            d='M'+'L'.join(f'{num(x)} {num(y)}' for x,y in jitter)+'Z'
            self.parts.append(f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{num(width*(.8 if j else 1))}" opacity="{.52 if j else .9}" stroke-linecap="round" stroke-linejoin="round"/>')
    def rect(self,x,y,w,h,**kw): self.poly([(x,y),(x+w,y),(x+w,y+h),(x,y+h)],**kw)
    def circle(self,x,y,r,fill=None,color=None,width=4):
        pts=[]
        phase=self.r.random()*6.28
        for i in range(33):
            t=i*math.tau/32
            rr=r+math.sin(3*t+phase)*.8+math.sin(5*t)*.4
            pts.append((x+math.cos(t)*rr,y+math.sin(t)*rr))
        self.poly(pts,fill=fill,color=color,width=width)
    def move(self,origin): self.parts.append(f'<g class="moving" style="transform-origin:{origin[0]}px {origin[1]}px">')
    def endmove(self): self.parts.append('</g>')
    def paper(self,x,y,w,h):
        self.rect(x+4,y+5,w,h,color=self.c['soft'],width=2)
        self.rect(x,y,w,h,fill=self.c['stock'],width=3.5)
    def rows(self,x,y,width,rows=3,gap=17):
        for i in range(rows):self.line(x,y+i*gap,x+width-(i%2)*15,y+i*gap,self.c['soft'],2.5)

def draw(p,kind):
    c=p.c
    if kind=='clipboard':
        p.poly([(126,49),(306,55),(300,239),(119,233)],fill=c['moss'],hatch=True)
        p.paper(136,63,153,157);p.rect(182,42,64,32,fill=c['orange'],hatch=True)
        p.rect(153,96,17,17);p.rect(153,132,17,17);p.rect(153,168,17,17)
        p.rows(184,104,79,3,36)
        p.line(152,206,252,206,c['green'],3)
        p.move((315,140));p.poly([(312,101),(329,106),(297,207),(281,218),(282,195)],fill=c['orange'],hatch=True)
        p.line(319,109,290,200,c['stock'],2);p.poly([(281,218),(284,202),(294,207)],fill=c['ink']);p.endmove()
    elif kind=='clock':
        p.poly([(151,207),(141,236),(163,236),(174,213)],fill=c['moss'],hatch=True)
        p.poly([(264,212),(276,238),(297,237),(285,205)],fill=c['moss'],hatch=True)
        p.circle(216,142,86,fill=c['moss']);p.circle(216,142,72,fill=c['stock'])
        for i in range(12):
            a=i*math.tau/12;p.line(216+math.sin(a)*58,142-math.cos(a)*58,216+math.sin(a)*65,142-math.cos(a)*65,c['soft'],3)
        p.line(216,142,188,117,c['ink'],5)
        p.move((216,142));p.line(216,142,238,94,c['orange'],5);p.circle(216,142,5,fill=c['ink'],width=2);p.endmove()
        p.line(199,52,199,36);p.line(233,52,233,36);p.line(199,36,233,36)
    elif kind=='drawer':
        p.poly([(112,77),(139,50),(286,50),(286,213),(260,240),(112,240)],fill=c['moss'],hatch=True)
        p.rect(112,77,148,163,fill=c['stock']);p.rect(122,89,128,62);p.rect(122,164,128,62)
        p.rect(160,108,53,20,fill=c['wash']);p.line(170,119,202,119);p.rect(160,184,53,20,fill=c['wash'])
        p.move((285,143));p.circle(288,146,43,fill=c['stock'],color=c['orange']);p.circle(288,146,34,color=c['soft'],width=2)
        p.line(316,179,343,218,c['orange'],11);p.line(270,140,302,140,c['green'],3);p.line(270,154,294,154,c['green'],3);p.endmove()
    elif kind=='cards':
        p.poly([(91,93),(227,61),(261,224),(124,248)],fill=c['moss'],hatch=True)
        p.poly([(206,54),(344,91),(309,245),(173,209)],fill=c['orange'],hatch=True)
        p.move((216,150));p.paper(145,54,145,183);p.circle(175,87,12,fill=c['wash']);p.rows(167,122,103,5,18)
        p.rect(165,215,37,10,fill=c['orange']);p.endmove()
    elif kind=='binder':
        p.poly([(113,55),(278,42),(306,53),(306,234),(140,246),(113,231)],fill=c['moss'],hatch=True)
        p.poly([(140,67),(306,53),(306,234),(140,246)],fill=c['stock'])
        p.line(140,67,140,246);p.circle(126,95,7,fill=c['stock']);p.circle(126,208,7,fill=c['stock'])
        p.paper(163,93,115,108);p.rows(180,120,80,4,20)
        p.move((310,140));p.rect(284,92,39,28,fill=c['orange'],hatch=True);p.rect(284,133,39,28,fill=c['wash'],hatch=True);p.rect(284,174,39,28,fill=c['wash'],hatch=True);p.endmove()
    elif kind=='press':
        p.rect(103,63,23,173,fill=c['moss'],hatch=True);p.rect(308,63,23,173,fill=c['moss'],hatch=True)
        p.rect(89,219,257,26,fill=c['moss'],hatch=True);p.rect(112,59,211,24,fill=c['moss'],hatch=True)
        p.line(214,35,214,101,c['ink'],7);p.line(176,36,252,36,c['orange'],7)
        p.paper(142,125,142,83);p.circle(253,148,11,fill=c['orange']);p.poly([(155,195),(186,157),(216,185),(239,167),(271,195)],fill=c['wash'],hatch=True)
        p.move((216,110));p.rect(131,102,169,18,fill=c['orange'],hatch=True);p.endmove()
    elif kind=='piano':
        p.poly([(97,108),(316,88),(341,118),(121,140)],fill=c['moss'],hatch=True)
        p.poly([(121,140),(341,118),(341,220),(121,238)],fill=c['stock'])
        p.line(121,160,341,138)
        for x in [152,183,214,245,276,307]:p.line(x,158-(x-121)*.1,x,235-(x-121)*.08)
        for x in [143,174,236,267,298]:p.poly([(x,153-(x-121)*.1),(x+17,151-(x-121)*.1),(x+17,191-(x-121)*.1),(x,193-(x-121)*.1)],fill=c['ink'])
        p.move((215,197));p.poly([(215,151),(245,148),(245,225),(215,228)],fill=c['orange'],hatch=True);p.endmove()
        p.line(98,132,76,145,c['orange'],5);p.line(76,145,74,202,c['orange'],5);p.line(74,202,101,215,c['orange'],5);p.rect(101,207,19,14,fill=c['moss'])
    elif kind=='fold':
        p.poly([(96,82),(194,67),(202,220),(105,235)],fill=c['wash'],hatch=True)
        p.poly([(194,67),(290,83),(283,235),(202,220)],fill=c['stock'])
        p.move((289,83));p.poly([(290,83),(349,64),(350,219),(283,235)],fill=c['orange'],hatch=True);p.line(311,107,334,100,c['pencil'],3);p.line(309,128,333,121,c['pencil'],3);p.endmove()
        p.rect(113,109,61,27,fill=c['moss']);p.rect(116,155,27,52,fill=c['stock']);p.rows(153,157,22,3,18)
        p.rect(215,112,50,27,fill=c['wash']);p.rect(215,160,49,43,fill=c['moss'],hatch=True)
    elif kind=='linked':
        p.line(143,114,222,174,c['orange'],4);p.line(219,174,294,105,c['orange'],4);p.line(219,174,306,225,c['orange'],4)
        p.paper(89,66,108,81);p.rows(105,94,76,2,19);p.circle(143,71,5,fill=c['orange'],width=2)
        p.paper(170,151,106,82);p.rows(187,181,72,2,20);p.circle(222,157,5,fill=c['orange'],width=2)
        p.move((292,80));p.poly([(250,52),(350,66),(338,144),(239,131)],fill=c['wash'],hatch=True);p.line(264,83,326,92,c['soft'],3);p.line(261,103,309,110,c['soft'],3);p.circle(295,66,5,fill=c['orange'],width=2);p.endmove()
    elif kind=='receipt':
        p.poly([(103,73),(302,73),(320,196),(91,196)],fill=c['moss'],hatch=True);p.rect(121,90,161,91,fill=c['ink']);p.line(143,111,157,123,c['green'],4);p.line(157,123,143,134,c['green'],4);p.line(166,136,201,136,c['green'],4)
        p.rect(92,196,228,26,fill=c['stock']);p.line(118,205,297,205,c['ink'],7)
        p.move((228,195));p.poly([(179,163),(279,163),(279,253),(270,247),(260,254),(250,247),(240,254),(230,247),(220,254),(210,247),(199,254),(188,247),(179,253)],fill=c['stock']);p.rows(194,182,69,4,17);p.line(194,232,232,232,c['orange'],4);p.endmove()
    elif kind=='scissors':
        p.paper(245,63,96,123);p.paper(236,55,96,123);p.rows(252,80,64,4,19);p.line(257,59,272,59,c['orange'],5)
        p.poly([(106,197),(209,124),(220,139),(140,221)],fill=c['moss'],hatch=True);p.circle(116,217,29,color=c['orange']);p.circle(116,217,17,color=c['orange'],width=3)
        p.move((211,135));p.poly([(131,87),(215,128),(205,144),(119,113)],fill=c['moss'],hatch=True);p.circle(107,94,29,color=c['orange']);p.circle(107,94,17,color=c['orange'],width=3);p.endmove();p.circle(211,135,8,fill=c['ink'])
        p.rect(267,194,77,44,fill=c['wash'],hatch=True);p.line(280,208,330,208,c['soft'],3);p.line(281,222,318,222,c['soft'],3)

class Glyphs:
    def __init__(self):self.defs={};self.metrics=[]
    def line(self,kind,txt,size,baseline,color,role):
        f,gs,cmap,upem=FONTS[kind]; scale=size/upem
        advances=[]
        for ch in txt:
            name=cmap.get(ord(ch))
            if not name:raise ValueError(f'Missing font glyph: {ch!r}')
            advances.append((ch,name,f['hmtx'][name][0]))
        width=sum(a for ch,n,a in advances)*scale
        if width>391:raise ValueError(f'Text too wide ({width:.1f}): {txt}')
        x=(W-width)/2; uses=[];cursor=0
        for ch,name,a in advances:
            gid=f'{kind}{ord(ch):x}'
            if gid not in self.defs:
                pen=SVGPathPen(gs,ntos=lambda n:num(n));gs[name].draw(pen)
                self.defs[gid]=f'<path id="{gid}" d="{pen.getCommands()}"/>'
            uses.append(f'<use href="#{gid}" x="{cursor}"/>');cursor+=a
        self.metrics.append(dict(text=txt,role=role,sourceSize=size,displaySizeAt108=size/4,advanceWidth=round(width,2),baseline=baseline))
        return f'<g class="static-text {role}" data-text="{esc(txt)}" data-size="{size}" aria-label="{esc(txt)}" fill="{color}" transform="translate({num(x)} {baseline}) scale({scale:.6f} {-scale:.6f})">'+''.join(uses)+'</g>'

def create(item,theme,index):
    ident,name,names,purpose,lines,kind,motion=item;c=THEMES[theme];p=Pencil(ident,c);g=Glyphs()
    if ' '.join(lines)!=purpose:raise ValueError('Purpose altered')
    fibers=[];r=random.Random(seed(ident+'paper'))
    for _ in range(105):
        x=r.uniform(12,W-12);y=r.uniform(10,H-10);length=r.uniform(4,13)
        fibers.append(f'<path d="M{num(x)} {num(y)}l{num(length)} {num(r.uniform(-2,2))}" stroke="{c["fiber"]}" stroke-width="{num(r.uniform(.5,1))}" opacity=".17"/>')
    p.rect(7,8,W-14,H-16,color=c['soft'],width=2)
    # A subdued cancellation mark carries the dealt postal stationery motif.
    for j in range(3):p.line(29,28+j*8,74,32+j*8,c['soft'],1.8,.35)
    draw(p,kind)
    # Torn-edge tape stays fixed. Only the small mechanical group above moves.
    tape=[(19,281),(54,278),(64,282),(366,280),(412,286),(408,305),(413,328),(409,352),(412,379),(405,398),(53,397),(21,401),(24,376),(19,350),(22,322)]
    points=' '.join(f'{x},{y}' for x,y in tape)
    labels=f'<polygon points="{points}" fill="{c["tape"]}"/>'
    bases=[357] if len(names)==1 else [327,384]
    for txt,y in zip(names,bases):labels+=g.line('mono',txt,56,y,c['tapeInk'],'name')
    bases=[463,531] if len(lines)==2 else [455,514,573]
    for txt,y in zip(lines,bases):labels+=g.line('hand',txt,60,y,c['ink'],'purpose')
    duration=7.6+(index%4)*.4;delay=-(index*.67)%duration
    # Long still intervals, one small gesture per cycle, staggered by tool.
    css=f'.moving{{transform-box:view-box;animation:gesture {duration:.1f}s cubic-bezier(.2,.8,.2,1) {-delay:.2f}s infinite}}@keyframes gesture{{0%,65%,84%,100%{{transform:none}}74%{{transform:{motion}}}}}@media(prefers-reduced-motion:reduce){{*{{animation:none!important;transition:none!important}}}}'
    desc=purpose+' Original pencil illustration. Text remains still; one small object part moves slowly. Motion is disabled when reduced motion is preferred.'
    result=f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}" role="img" aria-labelledby="title desc"><title id="title">{esc(name)}</title><desc id="desc">{esc(desc)}</desc><metadata>Original art, inspired by sketchy and sketch-board. Caveat and Courier Prime outlines under SIL OFL1.1; bundled notices in fonts/.</metadata><style>{css}</style><defs>'+''.join(p.defs)+''.join(g.defs.values())+'</defs>'+f'<rect width="{W}" height="{H}" fill="{c["paper"]}"/>'+''.join(fibers)+''.join(p.parts)+labels+'</svg>\n'
    filename=f'tile-{ident}-{theme}.svg';(ROOT/filename).write_text(result,encoding='utf-8',newline='\n')
    static=re.sub(r'<style>.*?</style>','',result)
    static=re.sub(r'<g class="moving" style="[^"]*">','<g class="mechanism">',static)
    static=static.replace(esc(desc),esc(purpose+' Original pencil illustration. Reduced-motion variant: all text and artwork remain still.'))
    staticname=f'tile-{ident}-static-{theme}.svg';(ROOT/staticname).write_text(static,encoding='utf-8',newline='\n')
    common=dict(name=name,purpose=purpose,width=W,height=H,text=g.metrics)
    return [dict(**common,filename=filename,bytes=len(result.encode()),static=False,motion=dict(durationSeconds=duration,activeFraction=.19,gesture=motion,groupCount=1)),dict(**common,filename=staticname,bytes=len(static.encode()),static=True,motion=dict(groupCount=0))]

manifest=[]
for theme in THEMES:
    for i,item in enumerate(ITEMS):manifest.extend(create(item,theme,i))
(ROOT/'manifest.json').write_text(json.dumps(dict(displayWidth=108,displayHeight=150,files=manifest),indent=2)+'\n',encoding='utf-8')
print(f'Generated {len(manifest)} SVGs; {sum(x["bytes"] for x in manifest):,} SVG bytes.')
