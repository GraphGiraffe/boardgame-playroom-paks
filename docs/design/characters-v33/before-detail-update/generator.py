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
 def limb(path):return line(path,13,'#fff')+line(path,6)
 def hand(x,y,angle=0,kind='wave'):
  paths={
   'wave':'M-6 8-10 0q-4-5-1-7 3-2 6 4L-7-10q0-5 3-5 3 0 3 10L2-13q2-4 5-2 2 2-1 12l5-5q4-3 6 0 1 3-6 10L6 10Z',
   'thumb':'M-6 10q-5-4-5-12 0-5 5-5h3l1-9q1-5 5-3 4 2 1 13h6q5 0 4 5l-3 10Z',
   'palm':'M-10 4q-8-8-4-10 3-1 7 4l8-7q5-5 7-2 2 2-2 6l7-2q5-1 5 3 0 3-9 7L0 12Z',
   'fist':'M-8 7q-7-6-3-14 3-5 8-1 5-5 8 0 6-1 8 4 3 9-6 14Z'}
  return f'<g transform="translate({x} {y}) rotate({angle}) scale(.7)"><path d="{paths[kind]}" fill="{ink}" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></g>'
 def shoe(x,y,angle=0):
  return f'<ellipse cx="{x}" cy="{y}" rx="15" ry="10" transform="rotate({angle} {x} {y})" fill="{color}" stroke="#fff" stroke-width="6"/>'
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
 face=eyes()+cheeks()+laugh();access='';front='';hands=''
 angle={'circle':-12,'triangle':-7,'square':3,'crescent':10,'star':-8,'rectangle':-4,'diamond':-2,'hexagon':-11}[shape]
 # Body and face share one transform; limbs remain anchored to its outline.
 body=shapes[shape]
 arms='M65 126Q45 133 30 114M192 118q18-2 27-17'
 legs='M103 183 91 216M152 181l19 20 15-12'
 feet=shoe(87,225,-12)+shoe(190,187,-40)
 hands=hand(28,110,-20)+hand(220,99,15)
 if shape=='circle':
  face=eyes(look=(5,-5))+cheeks()+laugh()
  access=f'<path d="m106 189 22 8-22 8Zm44 0-22 8 22 8Z" fill="{cream}"/><rect x="123" y="191" width="10" height="12" rx="3" fill="{ink}"/>'+line('M95 91q6-9 14-9M146 79q9 0 15 9',3)
 elif shape=='triangle':
  face=eyes(cy=148,look=(5,-7))+cheeks(cy=171)+line('M115 173q14 11 29-1',4)+'<path d="M133 177q20-7 15 10-10 9-15-10Z" fill="#ee8772" stroke="#713c32" stroke-width="2"/>'+line('M97 121q6-6 12-4M147 116q9-2 14 4',3)
  access=f'<path d="m128 28 29 53H99Z" fill="{cream}"/><g fill="{ink}"><circle cx="126" cy="46" r="4"/><circle cx="116" cy="69" r="4"/><circle cx="139" cy="73" r="4"/></g><circle cx="128" cy="23" r="7" fill="{cream}" stroke="{ink}" stroke-width="2"/>'
  arms='M83 114Q65 107 53 76M174 113q17-13 27-37';legs='M106 183 101 217M154 181l21 21 14-11'
  hands=hand(51,72,-15)+hand(202,72,15);feet=shoe(99,226,-15)+shoe(191,190,-40)
 elif shape=='square':
  face=eyes(wink=True,look=(4,-2))+cheeks()+laugh()+f'<g fill="none" stroke="{ink}" stroke-width="4"><circle cx="106" cy="124" r="27"/><circle cx="150" cy="124" r="27"/><path d="M79 119H70m107 0h9"/></g>'+line('M92 88q9-7 18-3M144 88q9-6 18 0',3)
  arms='M62 132 42 128 40 109M192 131q29 6 14 25l-9 2';legs='M104 181 91 222M151 181l17 41'
  hands=hand(39,111,0,'thumb')+hand(199,159,15,'fist');feet=shoe(86,230,-7)+shoe(172,230,7)
 elif shape=='crescent':
  # Original crescent opens to the left, with its face on the convex right side.
  body=f'<g transform="translate(256 0) scale(-1 1)">{body}</g>'
  face=eyes(cx=165,cy=123,look=(0,-2))+cheeks(cx=163,cy=146)+laugh(cx=164,cy=157)+line('M134 94q6-9 13-7M178 86q8-1 14 8',3)
  access=f'<path d="M88 27q48-54 89 3l-20 13q-16-25-51-6Z" fill="{cream}" stroke="#fff" stroke-width="6"/><path d="m87 26 20 12 53 7-15-19Z" fill="{ink}"/><circle cx="178" cy="36" r="10" fill="{cream}" stroke="#fff" stroke-width="5"/>'
  arms='M136 135Q66 144 49 100M185 157q21 4 16 23';legs='M119 182 123 218M151 183q17 19 32 8l1-5'
  hands=hand(48,96,-15)+hand(200,181,15,'fist');feet=shoe(119,227,-18)+shoe(185,190,-65)
 elif shape=='star':
  face=eyes(closed=True)+cheeks()+laugh()+line('M98 99q7-5 13-1M146 98q7-5 13 1',3)
  access=f'<path d="m99 51-7-31 16 9 16-22 16 22 16-9-8 31Z" fill="#e0bc59" stroke="#fff" stroke-width="6"/><path d="M103 43h41" stroke="#9e782d" stroke-width="3"/><g fill="{cream}" stroke="#9e782d" stroke-width="2"><circle cx="92" cy="19" r="5"/><circle cx="124" cy="6" r="5"/><circle cx="156" cy="19" r="5"/></g>'
  arms='M73 145q-23 3-26 23M181 121q28-4 29-39';legs='M108 180 96 219M150 180q4 22 23 23'
  hands=hand(45,169,-20,'fist')+hand(209,78,0);feet=shoe(91,228,-7)+shoe(177,210,-58)
 elif shape=='rectangle':
  face='<path d="M75 111h47l-5 22q-18 13-34-1Zm60 0h46l-8 21q-17 13-32 0Z" fill="#1f342e"/>'+line('M121 116q7-7 15 0M71 109l115-4',5)+line('M130 152q13-1 21-10',4)+line('M88 93q9-7 18-1M149 89q9-5 17 1',3)
  arms='';hands='';legs='M102 157 83 217M153 158l22 59';feet=shoe(77,228,-7)+shoe(180,228,7)
  front=limb('M91 155q25 10 51 0M167 155q-15-5-38 3')+hand(95,154,-20,'fist')+hand(163,155,20,'fist')
 elif shape=='diamond':
  face=eyes(cy=117,look=(6,-4))+cheeks(cy=142)+line('M116 150q13 12 27-1',4)+line('M98 88q7-7 15-5M144 83q10-3 17 5',3)
  access=f'<path d="m87 173 41 59 42-59-20 10-22 29-22-29Z" fill="{ink}"/><path d="m110 176 18 26 19-26Z" fill="{cream}"/><path d="m117 186 11 5 12-5v13l-12-5-11 5Z" fill="{ink}"/>'
  arms='';hands='';legs='M115 188 138 220M142 188l-22 32';feet=shoe(117,229,-10)+shoe(141,229,10)
  front=limb('M100 158q2 24 21 36M158 160q-10 22-30 34M157 170q12 1 23-3')+hand(121,192,0,'fist')+hand(132,192,0,'fist')+f'<path d="M175 160q15-3 30 7l-7 17-12-5-7 15-9-7 7-16Z" fill="{cream}" stroke="#fff" stroke-width="5"/>'+line('m194 167 7 4m-16 7 7 4',2)
 elif shape=='hexagon':
  face=eyes(look=(3,-3))+cheeks()+f'<ellipse cx="128" cy="158" rx="9" ry="12" fill="#713c32"/>'+line('M97 94q7-9 15-6M147 87q8-2 14 7',3)
  access=f'<path d="M85 35q5-45 54-32 24 6 27 30Z" fill="{cream}" stroke="#fff" stroke-width="6"/><path d="m143 10 5 15-21-2q-1-12 16-13" fill="{ink}"/><path d="m86 34 36-2-30 24-29 3Z" fill="{ink}" stroke="#fff" stroke-width="5"/>'
  arms='M68 126Q32 115 45 81l25-11M192 121q16 3 26-8';legs='M108 182 103 219M149 182l6 37'
  hands=hand(71,70,65,'fist')+hand(221,111,10,'palm');feet=shoe(99,229,-7)+shoe(160,229,7)
 body_scale='.68 .86' if shape=='diamond' else '.80'
 body_group=f'<g transform="translate(128 114) scale({body_scale}) translate(-128 -128)"><g fill="{color}" stroke="#fff" stroke-width="7" stroke-linejoin="round">{body}</g>{face}{access}</g>'
 return f'<g transform="translate(128 128) scale(.98) rotate({angle}) translate(-128 -128)">{limb(arms+" "+legs)}{feet}{hands}{body_group}{front}</g>'

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
