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
 def line(path,width=6):return f'<path d="{path}" fill="none" stroke="#264e43" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round"/>'
 def eyes(cx=128,cy=124,wink=False,closed=False):
  if closed:return line(f'M{cx-28} {cy}q10-13 20 0m16 0q10-13 20 0',4)
  left=f'<ellipse cx="{cx-18}" cy="{cy}" rx="13" ry="17" fill="#fffbed"/><ellipse cx="{cx-16}" cy="{cy-1}" rx="5" ry="9" fill="#264e43"/>'
  right=line(f'M{cx+7} {cy}q11-14 22 0',4) if wink else f'<ellipse cx="{cx+18}" cy="{cy}" rx="13" ry="17" fill="#fffbed"/><ellipse cx="{cx+20}" cy="{cy-1}" rx="5" ry="9" fill="#264e43"/>'
  return left+right
 def cheeks(cx=128,cy=144):return f'<g fill="#f19a83"><circle cx="{cx-31}" cy="{cy}" r="8"/><circle cx="{cx+31}" cy="{cy}" r="8"/></g>'
 smile='<ellipse cx="128" cy="153" rx="14" ry="12" fill="#713c32"/><path d="M116 158q12-8 24 0-12 15-24 0" fill="#ee8772"/>'
 body=f'<g fill="{color}" stroke="#fff" stroke-width="7" stroke-linejoin="round">{shapes[shape]}</g>'
 face='';access='';arms='M75 111 46 99 36 87m145 25 28-12 12-11';legs='M108 162 96 207m52-45 18 39'
 if shape=='circle':
  face=eyes()+cheeks()+smile
  access='<path d="m110 190 18 7-18 8Zm36 0-18 7 18 8Z" fill="#fffbed"/><circle cx="128" cy="197" r="5" fill="#264e43"/>'
 elif shape=='triangle':
  face=eyes(cy=151)+cheeks(cy=168)+line('M122 173q12 8 20-1',4)+'<path d="M132 174q20-3 15 10-9 8-15-10" fill="#ee8772" stroke="#713c32" stroke-width="2"/>'
  access='<path d="m128 28 29 53h-58Z" fill="#fffbed"/><g fill="#264e43"><circle cx="126" cy="48" r="4"/><circle cx="118" cy="70" r="4"/><circle cx="139" cy="75" r="4"/></g><circle cx="128" cy="24" r="6" fill="#fffbed"/>'
  arms='M87 119 53 75m117 44 29-44';legs='M109 168 99 207m47-39 23 26'
 elif shape=='square':
  face=eyes(wink=True)+cheeks()+smile+'<g fill="none" stroke="#264e43" stroke-width="4"><circle cx="110" cy="124" r="23"/><circle cx="146" cy="124" r="23"/><path d="M87 119H74m95 0h13"/></g>'
  arms='M72 123 49 122 46 106m137 23 23 12-14 13';legs='M106 166 91 209m57-43 16 43'
 elif shape=='crescent':
  face=eyes(cx=69,cy=123)+cheeks(cx=69,cy=144)+'<ellipse cx="69" cy="153" rx="12" ry="10" fill="#713c32"/><path d="M60 157q9-6 18 0" fill="none" stroke="#ee8772" stroke-width="5"/>'
  access='<path d="M104 29q56-53 91 7l-25 7q-8-28-44-6Z" fill="#fffbed" stroke="#fff" stroke-width="6"/><path d="m103 28 22 10 50 5-14-18Z" fill="#264e43"/><circle cx="194" cy="39" r="9" fill="#fffbed" stroke="#fff" stroke-width="5"/>'
  arms='M78 111 48 95 39 79m62 45 28 17-6 13';legs='M85 163 79 209m28-45 28 29'
 elif shape=='star':
  face=eyes(closed=True)+cheeks()+smile
  access='<g transform="rotate(-16 123 35)"><path d="m98 50-7-31 16 9 16-21 16 21 16-9-7 31Z" fill="#e0bc59" stroke="#fff" stroke-width="6"/><path d="M104 43h38" stroke="#9e782d" stroke-width="3"/><g fill="#fffbed"><circle cx="91" cy="18" r="4"/><circle cx="123" cy="7" r="4"/><circle cx="155" cy="18" r="4"/></g></g>'
  arms='M85 124 57 145m114-28 27-31';legs='M108 166 96 210m47-44 22 32'
 elif shape=='rectangle':
  face='<path d="M77 111h45l-4 20q-16 14-32 0Zm56 0h45l-9 20q-16 14-32 0Z" fill="#1f342e"/>'+line('M121 117q6-7 13 0M73 109l109-5',5)+line('M129 151q12 0 20-9',4)
  access=line('M91 174q36 13 73-3',9)+'<g fill="#264e43"><circle cx="94" cy="174" r="10"/><circle cx="162" cy="173" r="10"/></g>'
  arms='';legs='M109 145 88 209m56-64 25 64'
 elif shape=='diamond':
  face=eyes()+cheeks()+line('M116 153q12 10 24 0',4)
  access='<path d="m84 172 44 60 44-60Z" fill="#264e43"/><path d="m107 172 21 28 21-28Z" fill="#fffbed"/><path d="m116 183 12 5 12-5v13l-12-5-12 5Z" fill="#264e43"/><circle cx="128" cy="206" r="4" fill="#e0bc59"/>'
  arms='M85 132 94 162m75-31 26 15 10-13';legs='M120 178 117 213m19-35 3 35'
 elif shape=='hexagon':
  face=eyes()+cheeks()+'<ellipse cx="128" cy="157" rx="9" ry="12" fill="#713c32"/>'
  access='<path d="M87 35q5-43 51-31 24 5 28 29Z" fill="#fffbed" stroke="#fff" stroke-width="6"/><path d="M112 6q-10 10-10 26m25-17h16" fill="none" stroke="#264e43" stroke-width="4"/><path d="m86 34 33-3-27 25-28 4Z" fill="#264e43" stroke="#fff" stroke-width="5"/>'
  arms='M78 118 52 129l3 13m127-22 25-12 11-11';legs='M108 162 102 209m43-47 9 47'
 limbs=''
 if arms or legs:
  limbs=f'<path d="{arms} {legs}" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>'+line(arms+' '+legs)
 foots={'circle':(96,207,166,201),'triangle':(99,207,169,194),'square':(91,209,164,209),'crescent':(79,209,135,193),'star':(96,210,165,198),'rectangle':(88,209,169,209),'diamond':(117,213,139,213),'hexagon':(102,209,154,209)}
 lx,ly,rx,ry=foots[shape]
 feet=f'<g fill="{color}" stroke="#fff" stroke-width="6"><ellipse cx="{lx}" cy="{ly}" rx="13" ry="7"/><ellipse cx="{rx}" cy="{ry}" rx="13" ry="7" transform="rotate(-25 {rx} {ry})"/></g>'
 return limbs+feet+f'<g transform="translate(128 116) scale(.88) translate(-128 -128)">{body}{face}{access}</g>'
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
