#!/usr/bin/env python3
"""Deterministic flat companion art; original sticker assets are never modified."""
from pathlib import Path
import base64, hashlib, json, math
ROOT=Path(__file__).resolve().parents[1]
base=ROOT/'shared/asset-packs'
original=json.loads((base/'characters/manifest.json').read_text())
colors={'red':'#df785e','orange':'#e69b4a','yellow':'#e0bc59','green':'#5b8a66','blue':'#699bab','purple':'#a389b3'}
star=' '.join(f'{128+math.sin(i*math.pi/5)*(104 if i%2==0 else 48):.2f},{128-math.cos(i*math.pi/5)*(104 if i%2==0 else 48):.2f}' for i in range(10))
shapes={
 'circle':'<circle cx="128" cy="128" r="92"/>',
 'square':'<rect x="40" y="40" width="176" height="176" rx="18"/>',
 'rectangle':'<rect x="28" y="68" width="200" height="120" rx="16"/>',
 'triangle':'<path d="M128 28 232 218H24Z" stroke-linejoin="round"/>',
 'diamond':'<path d="m128 24 104 104-104 104L24 128Z"/>',
 'hexagon':'<path d="M76 36h104l52 92-52 92H76l-52-92Z"/>',
 'star':f'<polygon points="{star}"/>',
 'crescent':'<path d="M184 30C103-2 24 47 24 128s79 130 160 98C91 217 70 65 184 30Z"/>'}
def character(shape,color):
 # Draw in the original 512px sticker coordinates. Every pose is traced separately;
 # simplified execution must not replace its anatomy with a generic skeleton.
 ink='#264e43'; cream='#fffbed'; mouth='#713c32'; pink='#ee8772'
 def path(d,fill=ink,stroke=None,width=3):
  border=f' stroke="{stroke}" stroke-width="{width}" stroke-linejoin="round"' if stroke else ''
  return f'<path d="{d}" fill="{fill}"{border}/>'
 def line(d,w=11,stroke=ink):
  return f'<path d="{d}" fill="none" stroke="{stroke}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>'
 def ellipse(x,y,rx,ry,fill,angle=0):
  return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" transform="rotate({angle} {x} {y})"/>'
 def eye(x,y,rx=19,ry=24,angle=0,dx=5,dy=-1,prx=12,pry=17):
  return f'<g transform="rotate({angle} {x} {y})">'+ellipse(x,y,rx,ry,cream)+ellipse(x+dx,y+dy,prx,pry,ink)+ellipse(x+dx-4,y+dy-8,4,3,cream)+'</g>'
 def cheeks(a,b):return ellipse(*a,15,13,'#f19a83')+ellipse(*b,15,13,'#f19a83')
 def smile(d,tongue):return path(d,mouth)+path(tongue,pink)
 def foot(x,y,rx=30,ry=20,angle=0):return ellipse(x,y,rx,ry,color,angle)
 def hand(x,y,angle=0,size=.8,kind='wave',mirror=False):
  # All open hands have three rounded fingers plus one thumb.
  glove=color if shape=='star' else ink
  silhouettes={
   'wave':'M-13 13Q-21 6-20-2q1-5 5-4l7 6-4-12q-3-8 2-10 5-2 7 6L0-7l1-16q0-6 5-5 5 1 4 7L8-6l7-11q4-6 8-2 3 4-1 9L14 6Q12 20 2 22q-10 2-15-9Z',
   'palm':'M-18 7q-7-5-3-12 3-6 7-2l5 6-2-11q-1-6 4-7 5 0 5 6L0-3l10-9q5-4 8 0 2 4-3 7L8 1l13-4q7-2 8 3 0 5-6 6L9 14Q-8 23-18 7Z',
   'fist':'M-15 10q-6-6-3-15 2-7 8-6 4-7 10-2 7-4 11 3 8 0 9 8 0 13-13 17-14 4-22-5Z'}
  sx=-size if mirror else size
  return f'<g transform="translate({x} {y}) rotate({angle}) scale({sx} {size})">'+path(silhouettes[kind],glove)+'</g>'
 back='';body='';face='';access='';front=''
 if shape=='circle':
  back=line('M235 310Q225 352 211 369M291 304Q315 319 336 338',13)+foot(215,389,31,21,20)+foot(361,335,21,31,36)
  back+=line('M174 252Q139 260 126 238M353 219Q378 207 385 192',11)+hand(123,232,-22,.78)+hand(388,186,17,.78,mirror=True)
  body=ellipse(251,202,108,113,color,25)
  face=eye(225,202,19,24,-22,5,1)+eye(298,180,18,24,-22,4,2)+cheeks((214,237),(321,210))
  face+=line('M205 173q5-16 16-13M280 140q12-5 21 4',4)
  face+=smile('M250 227Q266 237 289 219Q296 249 272 254Q252 255 250 227Z','M256 245q16-15 30-3-11 17-23 9Z')
  access=path('M239 269q9-4 23 9l1 12q-18 15-25 9-4-15 1-30ZM278 277q19-14 25-13 7 13 4 30-7 6-27-6Z',cream)+ellipse(271,283,9,12,ink)
 elif shape=='triangle':
  back=line('M216 345Q211 381 222 413M285 338Q307 364 336 382',13)+foot(219,434,31,20,-18)+foot(360,382,21,31,31)
  back+=line('M174 245Q143 235 136 199M343 236Q369 216 376 189',11)+hand(136,187,-12,.70)+hand(378,181,14,.70,mirror=True)
  body=path('M269 63Q277 111 290 144L394 315q7 12-7 14L122 352q-14 2-7-11L252 89q9-20 17-26Z',color)
  face=eye(215,244,20,19,0,7,-6,12,13)+eye(284,228,21,20,0,5,-7,12,14)+cheeks((196,270),(310,254))
  face+=line('M205 204q10-2 17-9M267 187q9 9 23 6',5)+line('M229 273q28 17 56-8',6)
  face+=path('M271 280q20-11 27 8 7 23-10 17-14-3-17-25Z',pink,mouth,3)+line('M278 278q8 3 11 11',3,mouth)
  # The cream party hat follows the same outer edges as the triangle;
  # polka dots are clipped so their partial circles stay inside the fabric.
  hat='M267 64Q269 101 285 140q-30-1-52-16l19-33Z'
  access='<defs><clipPath id="party-hat">'+path(hat)+'</clipPath></defs>'+path(hat,cream,ink,2.2)
  access+='<g clip-path="url(#party-hat)">'+ellipse(253,85,7,7,ink)+ellipse(263,110,7,7,ink)+ellipse(236,123,8,7,ink)+ellipse(276,138,5,4,ink)+'</g>'
  access+=f'<g stroke="{ink}" stroke-width="2.5">'+ellipse(267,63,10,10,cream)+'</g>'
 elif shape=='square':
  back=line('M215 335 191 418M302 336l26 83',15)+foot(171,442,40,21,-8)+foot(351,446,40,22,6)
  body=path('M165 46 388 57q28 2 26 30l-12 226q0 25-26 24H150q-26 0-25-27l6-229q0-35 34-35Z',color)
  face=eye(211,171,30,34,0,9,2,18,25)+cheeks((183,227),(334,232))
  face+=f'<g fill="none" stroke="{ink}" stroke-width="5"><ellipse cx="205" cy="169" rx="47" ry="46"/><ellipse cx="324" cy="181" rx="48" ry="45"/><path d="M252 176q13-11 24 3M158 160l-10-2m224 26h10"/></g>'
  face+=line('M299 183q19-26 40 1',7)+line('M198 114q13-10 26-5M311 126q14-6 23 7',5)
  face+=smile('M237 219q28 15 62 2-5 38-28 41-29 0-34-43Z','M250 250q22-27 45-11-15 31-36 19Z')
  # Arms and thumb remain in front of the body, like the original side grip.
  front=line('M130 255q-33 30-41 5-5-17 0-35M401 233q51 24 22 50l-11 7',13)
  front+=path('M89 199q-2-15 1-25 4-10 11-6 8 4 6 22v9q13 2 12 14 1 9-5 14 3 10-7 14-5 9-17-1-15-6-11-24-1-12 10-17Z')
  front+=line('M91 209q10-5 22 0M90 222q12-3 21 1M91 234q9-1 16 2',2.5,'#507064')+hand(412,303,10,.88,'fist')
 elif shape=='crescent':
  back=line('M224 374q1 32 15 57M267 373q25 27 62 22',13)+foot(225,450,32,18,-15)+foot(345,409,18,30,-10)
  back+=line('M210 284q-57 1-65-61M355 308q35 13 20 39',12)+hand(148,208,-8,.8)+hand(367,356,12,.85,'fist')
  body=path('M183 91C253 58 345 115 366 206c27 98-45 181-146 168-32-4-61-15-80-30q-10-7 1-13 84-27 88-111 3-74-46-119-7-6 0-10Z',color)
  face=eye(260,231,18,24,10,3,0)+eye(321,247,18,24,10,2,-1)+cheeks((235,255),(345,276))
  face+=line('M258 190q11-14 23-7M326 199q13-4 18 9',4)
  face+=smile('M261 268q16 13 38 3 8 31-15 30-24-1-23-33Z','M268 292q14-15 27-1-12 17-23 5Z')
  access=f'<g stroke="#252a25" stroke-width="2.2" stroke-linejoin="round">'+path('M223 73Q263 26 309 47q44 20 55 97l-22 9q-12-43-42-57-39-23-77-23Z',cream)+path('M223 74q45-2 96 27l3 14q-56-29-102-33Z',ink)+ellipse(367,150,18,18,cream)+'</g>'
 elif shape=='star':
  back=line('M228 351q-20 40-12 78M262 336q13 53 61 57',13)+foot(205,449,31,18,-15)+foot(343,410,20,30,-12)
  back+=line('M162 268q-43 8-44 41M336 252q39-11 44-66',12)+hand(131,324,-15,.88,'fist')+hand(385,164,0,.85)
  body=path('M239 99 303 173l65 12q13 3 5 16l-44 77 38 74q8 16-10 12l-98-27-90 45q-17 8-13-13l7-83-57-58q-14-13 2-21l72-27 33-69q10-20 26-12Z',color)
  face=line('M188 237q13-23 27-1M271 234q14-22 27 0',7)+line('M197 197q12-11 22-3M275 193q12-10 23 3',5)+cheeks((189,264),(308,262))
  face+=smile('M223 257q22 10 45-2 4 33-21 37-24-2-24-35Z','M231 282q17-17 31-2-11 19-26 9Z')
  # Three rounded tips and one curved gold band, following the source crown.
  gold='#d7ac48'; edge='#ac8330'
  access=path('M195 99 211 118Q239 111 258 96L246 54 226 84 210 73 211 100 203 96Z',cream,gold,5)
  access+=line('M211 114q27-6 45-18',5,gold)
  for x,y,r in [(194,98,7),(210,73,8),(246,53,9)]:
   access+=f'<g stroke="{edge}" stroke-width="2">'+ellipse(x,y,r,r,gold)+'</g>'+ellipse(x-2,y-2,r*.33,r*.33,cream)
 elif shape=='rectangle':
  back=line('M202 302 157 377M308 300l46 74',19)+foot(139,406,43,25,-6)+foot(376,404,43,25,7)
  body=path('M106 95 387 76q28-2 30 25l10 164q1 21-22 23l-290 20q-25 2-26-22L80 122q-2-24 26-27Z',color)
  face=path('M145 160q45-23 88-14 14 3 7 23l-14 25q-20 30-50 11-17-14-22-38Z','#1f342e')
  face+=path('M279 145q45-22 86-11 12 5 5 17l-16 29q-19 29-47 14-15-10-21-30Z','#1f342e')
  face+=line('M237 156q20-15 42-5M141 161l11-2m215-16 7-2',10,'#1f342e')+line('M172 133q16-19 33-9M307 115q18-15 34 0',6)
  face+=line('M264 232q19-2 33-21m-6-4 10 7',5)
  front=line('M190 268q61 36 139-2M329 272q-58 22-133 4',23)+hand(191,270,-8,1.25,'fist')+hand(329,266,14,1.25,'fist')
 elif shape=='diamond':
  back=line('M235 359q10 31-3 61M284 357q-14 33-11 63',13)+foot(233,444,30,27,-5)+foot(272,444,29,27,5)
  body=path('M256 38 376 225q8 10-1 19L276 377q-11 17-23 0L137 245q-10-11 0-23L245 43q7-12 11-5Z',color)
  face=eye(211,217,27,27,0,8,-3,15,20)+eye(301,201,27,27,0,7,-2,15,20)+cheeks((191,257),(328,239))
  face+=line('M198 172q10-13 20-9M289 153q12-5 22 5',5)+line('M250 251q15 17 29-4',5)
  access=path('M180 294q65 28 133 2l1 23q-64 34-126-4Z',cream)
  access+=path('M320 295q31-15 54-5 11 45-32 35Z',cream)+path('M318 309q-8 27-24 40l27 19q29-20 33-44Z',cream)
  access+=line('M361 293q6 18-3 28M368 293q6 18-3 28M308 346l19 13m-24-9 19 13',4,ink)+ellipse(319,300,11,11,cream)
  front=line('M196 300q9 32 37 49M315 302q-13 30-39 49',11)+hand(236,356,-12,.9,'fist')+hand(271,357,12,.9,'fist')
 elif shape=='hexagon':
  back=line('M211 329 202 380M271 329l12 52',14)+foot(189,403,35,21,-8)+foot(295,402,35,21,8)
  back+=line('M143 253q-38-15-31-43 4-13 16-23M344 254q25 9 36-13',12)+hand(388,230,0,.88,'palm')
  body=path('M176 152 289 125q8-3 13 7l51 91q6 8 0 16l-46 82q-4 9-14 8H189q-10 1-15-9l-37-80q-5-9 2-19l32-63q2-5 5-6Z',color)
  face=eye(210,221,20,24,-7,6,0)+eye(287,207,20,24,-7,6,0)+cheeks((188,251),(310,240))
  face+=line('M192 185q7-14 19-9M275 168q12-9 22 4',5)+ellipse(251,261,11,17,mouth)+path('M243 268q9-12 17-1-7 17-14 6Z',pink)
  access=f'<g stroke="#252a25" stroke-width="2.2" stroke-linejoin="round">'+path('M159 153q-4-44 46-65 50-25 72 21l10 18-119 32Z',cream)+path('M159 151q-29 1-48 19-10 14 7 16l45-22Z',ink)+path('M234 109q13-19 29-1l5 15-29 8Z','#50362b')+ellipse(203,89,7,5,ink)+'</g>'
  front=hand(137,175,58,1.05,'fist')
 art=back+body+face+access+front
 outline='<defs><filter id="sticker-outline" x="-16" y="-16" width="288" height="288" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="3" result="rim"/><feFlood flood-color="white"/><feComposite in2="rim" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
 return outline+'<g filter="url(#sticker-outline)"><g transform="scale(.5)">'+art+'</g></g>'

sets={}
for style in ['minimal','simple']:
 pack=base/('characters-'+style);(pack/'runtime').mkdir(parents=True,exist_ok=True)
 items=[]
 for item in original['items']:
  shape=item['shape'];color=colors[item['color']];body=f'<g fill="{color}">{shapes[shape]}</g>'
  content=character(shape,color) if style=='minimal' else f'<g fill="{color}" stroke="#fff" stroke-width="6" stroke-linejoin="round">{shapes[shape]}</g>'
  svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" role="img" aria-label="{item["label"]}">{content}</svg>\n'
  file='runtime/'+item['id']+'.svg';raw=svg.encode();(pack/file).write_bytes(raw)
  items.append({k:item[k] for k in ['id','shape','color','label']}|{'file':file,'sha256':hashlib.sha256(raw).hexdigest(),'src':'data:image/svg+xml;base64,'+base64.b64encode(raw).decode()})
 manifest={'format':'playroom-asset-pack','formatVersion':1,'id':'characters-'+style,'version':'0.1.0','name':'Минималистичные персонажи' if style=='minimal' else 'Простые фигуры','canvas':[256,256],'alpha':True,'semanticSource':{'id':'characters','version':'0.1.1'},'shapes':original['shapes'],'colors':original['colors'],'items':[{k:v for k,v in i.items() if k!='src'} for i in items],'files':['renderer.js'],'scripts':['renderer.js']}
 (pack/'renderer.js').write_text('(function(root){(root.PlayroomCharacterSets ||= {}).'+style+'=Object.freeze('+json.dumps({i['id']:i['src'] for i in items},ensure_ascii=False,separators=(',',':'))+');})(globalThis);\n')
 (pack/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
 (pack/'catalog.json').write_text(json.dumps({'id':manifest['id'],'version':'0.1.0','items':items},ensure_ascii=False,separators=(',',':'))+'\n')
 (pack/'README.md').write_text('# '+manifest['name']+'\n\n48 прозрачных SVG; semantic ID и цветовые роли исходных персонажей сохранены. Пересоздание: `python3 scripts/generate-character-sets.py`. Набор используется аватарами и колодой персонажей.\n')
 sets[style]=items
# Separate avatar registry: original embedded catalogue remains unchanged.
(base/'character-styles').mkdir(exist_ok=True)
(base/'character-styles/catalog.json').write_text(json.dumps({'styles':['detailed','minimal','simple'],'sets':sets},ensure_ascii=False,separators=(',',':'))+'\n')
print('Generated: 2 sets × 48 SVG, transparent 256×256')
