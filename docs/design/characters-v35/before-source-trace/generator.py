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
 # Flat silhouettes retain the gesture, handedness and expression of each sticker.
 ink='#264e43'; cream='#fffbed'
 def line(path,width=5,stroke=ink):
  return f'<path d="{path}" fill="none" stroke="{stroke}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>'
 def limb(path):return line(path,7)
 def hand(x,y,angle=0,kind='wave',mirror=False):
  # Cartoon hands have exactly three fingers and one thumb.
  glove=color if shape=='star' else ink
  paths={
   'wave':'M-9 12Q-15 7-18 0q-2-5 2-6 3-1 8 6l-3-18q-1-6 3-6 4-1 5 5L0-6v-19q0-6 4-6t4 6L9-6l5-16q2-6 6-4 4 1 2 7l-5 26q-1 14-13 16-9 1-13-11Z',
   'palm':'M-9 12Q-15 7-18 0q-2-5 2-6 3-1 8 6l-3-18q-1-6 3-6 4-1 5 5L0-6v-19q0-6 4-6t4 6L9-6l5-16q2-6 6-4 4 1 2 7l-5 26q-1 14-13 16-9 1-13-11Z',
   'thumb':'M-11 17V-8l1-12q1-6 6-4 4 1 3 7L-3-5h13q6 0 6 5 2 3-1 6 2 4-2 6 2 5-3 8H-5q-5 0-6-3Z',
   'fist':'M-11 9q-5-5-3-12 1-6 6-5 3-6 8-2 6-3 9 2 7 0 7 7 0 11-11 14-10 2-16-4Z'}
  folded=line("M1 0h9M0 6h9",1.8,"#78998b") if kind=='thumb' else ''
  size=.72 if kind=='thumb' else .52
  sx=-size if mirror else size
  return f'<g transform="translate({x} {y}) rotate({angle}) scale({sx} {size})"><path d="{paths[kind]}" fill="{glove}"/>{folded}</g>'
 def shoe(x,y,angle=0):
  return f'<path transform="translate({x} {y}) rotate({angle})" d="M-15 5q-1-13 9-14h7q4 3 9 5 10 3 7 11-13 5-32-2Z" fill="{color}"/>'
 def eyes(cx=128,cy=124,wink=False,closed=False,look=(4,-4)):
  if closed:return line(f'M{cx-30} {cy}q9-14 20 0m19 0q9-14 20 0',4)
  result=''
  for i,dx in enumerate([-22,22]):
   if wink and i==1:result+=line(f'M{cx+10} {cy}q12-14 25 0',4);continue
   result+=f'<ellipse cx="{cx+dx}" cy="{cy}" rx="15" ry="19" fill="{cream}"/><ellipse cx="{cx+dx+look[0]}" cy="{cy+look[1]}" rx="7" ry="11" fill="{ink}"/><circle cx="{cx+dx+look[0]-2}" cy="{cy+look[1]-5}" r="2.5" fill="{cream}"/>'
  return result
 def cheeks(cx=128,cy=148):return f'<g fill="#f19a83"><ellipse cx="{cx-35}" cy="{cy}" rx="9" ry="7"/><ellipse cx="{cx+35}" cy="{cy}" rx="9" ry="7"/></g>'
 def laugh(cx=128,cy=160):
  return f'<path d="M{cx-16} {cy-5}q16 7 32-3 2 28-17 25-17-1-15-22Z" fill="#713c32"/><path d="M{cx-12} {cy+12}q12-11 23-1-12 14-23 1" fill="#ee8772"/>'
 face=eyes()+cheeks()+laugh();access='';front='';hands='';headwear=''
 angle={'circle':-12,'triangle':-7,'square':3,'crescent':10,'star':-8,'rectangle':-4,'diamond':-2,'hexagon':-11}[shape]
 # Body and face share one transform; limbs remain anchored to its outline.
 body=shapes[shape]
 arms='M77 121Q57 126 52 111M175 110q17-2 22-17'
 legs='M113 151Q111 179 100 198M141 150Q151 161 163 174L176 161'
 feet=shoe(100,208,-12)+shoe(182,162,-48)
 hands=hand(50,108,-20,mirror=True)+hand(199,91,15)
 if shape=='circle':
  face=eyes(look=(5,-5))+cheeks()+laugh()
  access=f'<path d="m106 189 22 8-22 8Zm44 0-22 8 22 8Z" fill="{cream}"/><rect x="123" y="191" width="10" height="12" rx="3" fill="{ink}"/>'+line('M95 91q6-9 14-9M146 79q9 0 15 9',3)
 elif shape=='triangle':
  face=eyes(cy=148,look=(5,-7))+cheeks(cy=171)+line('M115 173q14 11 29-1',4)+'<path d="M133 177q20-7 15 10-10 9-15-10Z" fill="#ee8772" stroke="#713c32" stroke-width="2"/>'+line('M97 121q6-6 12-4M147 116q9-2 14 4',3)
  access=f'<path d="m128 28 29 53H99Z" fill="{cream}"/><g fill="{ink}"><circle cx="126" cy="46" r="4"/><circle cx="116" cy="69" r="4"/><circle cx="139" cy="73" r="4"/></g><circle cx="128" cy="23" r="7" fill="{cream}" stroke="{ink}" stroke-width="2"/>'
  arms='M91 119Q75 110 68 92M170 117q17-13 20-29';legs='M107 172Q102 192 107 210M144 169Q154 181 169 190L178 183'
  hands=hand(67,87,-15,mirror=True)+hand(191,84,15);feet=shoe(106,220,-12)+shoe(185,185,-48)
 elif shape=='square':
  face=eyes(wink=True,look=(4,-2))+cheeks()+laugh()+f'<g fill="none" stroke="{ink}" stroke-width="4"><circle cx="106" cy="124" r="27"/><circle cx="150" cy="124" r="27"/><path d="M79 119H70m107 0h9"/></g>'+line('M92 88q9-7 18-3M144 88q9-6 18 0',3)
  arms='M69 119Q53 121 51 111M199 117q20 7 8 25l-8 2';legs='M109 165 94 208M157 165l14 43'
  hands=hand(202,145,15,'fist');front=hand(52,111,-5,'thumb');feet=shoe(88,218,-7)+shoe(176,218,7)
 elif shape=='crescent':
  # Original crescent opens to the left, with its face on the convex right side.
  body='<path d="M75 30C152-2 226 45 226 122c4 87-86 122-174 90C126 185 149 93 75 30Z"/>'
  face=eyes(cx=164,cy=130,look=(0,-2))+cheeks(cx=164,cy=151)+laugh(cx=164,cy=161)+line('M130 101q6-7 12-4M175 98q8-1 13 6',3)
  headwear=f'<g stroke="#252a25" stroke-width="1.8" stroke-linejoin="round"><path d="M91 36q30-44 57-14 20 17 25 40l-17-8q-12-26-30-16l-24 12Z" fill="{cream}"/><path d="M93 37q26-16 62 14l-7 13q-29-25-49-13Z" fill="{cream}"/><circle cx="174" cy="65" r="9" fill="{cream}"/></g>'
  arms='M117 126Q92 133 79 113l-6-15M169 152q20 5 15 23';legs='M117 181Q117 204 121 215M144 181q14 24 27 15'
  hands=hand(72,94,-15)+hand(183,177,15,'fist');feet=shoe(115,224,-18)+shoe(174,197,-65)
 elif shape=='star':
  rounded_star=' '.join(f'{128+math.sin(i*math.pi/5)*(100 if i%2==0 else 62):.2f},{128-math.cos(i*math.pi/5)*(100 if i%2==0 else 62):.2f}' for i in range(10))
  body=f'<polygon points="{rounded_star}" stroke="{color}" stroke-width="6" stroke-linejoin="round"/>'
  face=eyes(cy=116,closed=True)+cheeks(cy=133)+laugh(cy=141)+line('M98 94q7-5 13-1M146 93q7-5 13 1',3)
  headwear='<g transform="translate(-9 8) rotate(-15 119 43)" stroke="#ac8330" stroke-width="1.7" stroke-linejoin="round"><path d="m100 49-4-30 12 10 11-18 10 19 14-6-6 27Z" fill="#e0bc59"/><path d="M102 45h32" fill="none"/><g fill="#fffbed"><circle cx="96" cy="18" r="4.5"/><circle cx="119" cy="10" r="4.5"/><circle cx="143" cy="23" r="4.5"/></g></g>'
  arms='M96 132Q67 141 63 162M159 112q35 0 36-33';legs='M114 163q-10 27-4 53M139 162q6 30 26 27'
  hands=hand(62,164,-20,'fist')+hand(195,76,0);feet=shoe(109,226,-7)+shoe(170,196,-65)
 elif shape=='rectangle':
  face='<path d="M75 111h47l-5 22q-18 13-34-1Zm60 0h46l-8 21q-17 13-32 0Z" fill="#1f342e"/>'+line('M121 116q7-7 15 0M71 109l115-4',5)+line('M130 152q13-1 21-10',4)+line('M88 93q9-7 18-1M149 89q9-5 17 1',3)
  arms='';hands='';legs='M101 143 82 194M153 143l23 51';feet=shoe(77,205,-7)+shoe(180,205,7)
  front=limb('M91 143q25 10 51 0M167 143q-15-5-38 3')+hand(95,142,-20,'fist')+hand(163,143,20,'fist')
 elif shape=='diamond':
  face=eyes(cy=117,look=(6,-4))+cheeks(cy=142)+line('M116 150q13 12 27-1',4)+line('M98 88q7-7 15-5M144 83q10-3 17 5',3)
  # A scarf and shy clasped hands, without a jacket or bow tie.
  access=f'<path d="M82 155q44 32 90 0l-3 16q-39 26-81-3Z" fill="{cream}"/><path d="m164 165 30 5-8 26-13-9-9 10-8-12Z" fill="{cream}"/>'+line('m174 174 11 4m-15 7 8 5',2)
  arms='';hands='';legs='M115 188Q125 199 117 213M141 188Q131 199 139 213';feet=shoe(117,229,-10)+shoe(141,229,10)
  front=limb('M99 154q2 30 22 40M158 154q-9 28-30 40')+hand(121,192,0,'fist')+hand(132,192,0,'fist')
 elif shape=='hexagon':
  face=eyes(look=(3,-3))+cheeks()+f'<ellipse cx="128" cy="158" rx="9" ry="12" fill="#713c32"/>'+line('M97 94q7-9 15-6M147 87q8-2 14 7',3)
  headwear=f'<g stroke="#252a25" stroke-width="1.8" stroke-linejoin="round"><path d="M83 64q-3-27 25-34 27-7 38 21l-29 12Z" fill="{cream}"/><path d="m123 35 6 13-14 1q-4-12 8-14" fill="{ink}"/><path d="M86 57q-14-3-27 5-5 5 3 8 14 0 29-9Z" fill="{ink}"/></g>'
  arms='M82 117Q54 112 58 81l10-16M164 119q14 17 30 1';legs='M108 160 105 198M137 160l7 38'
  hands=hand(194,116,75,'palm');front=hand(69,63,65,'fist');feet=shoe(99,209,-7)+shoe(150,209,7)
 # Body proportions and limb placement follow the original stickers independently.
 # Rotating the complete skeleton exaggerated knees and made planted feet lean.
 scale,position={
  'circle':('.63',(126,106)), 'triangle':('.69',(128,113)),
  'square':('.82',(133,96)), 'crescent':('.70',(118,114)),
  'star':('.74',(121,119)), 'rectangle':('.82 .90',(128,92)),
  'diamond':('.68 .86',(128,114)), 'hexagon':('.54',(121,112))}[shape]
 bx,by=position
 body_group=f'<g transform="translate({bx} {by}) rotate({angle}) scale({scale}) translate(-128 -128)"><g fill="{color}" stroke-linejoin="round">{body}</g>{face}{access}</g>'
 art=f'<g transform="translate(128 128) scale(.98) translate(-128 -128)">{limb(arms+" "+legs)}{feet}{hands}{body_group}{headwear}{front}</g>'
 art=art.replace('stroke="#fff" stroke-width="6"','stroke="none"').replace('stroke="#fff" stroke-width="5"','stroke="none"')
 return '<defs><filter id="sticker-outline" x="-16" y="-16" width="288" height="288" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="3" result="rim"/><feFlood flood-color="white"/><feComposite in2="rim" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#sticker-outline)">'+art+'</g>'

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
