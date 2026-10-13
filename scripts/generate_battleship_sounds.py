"""Original deterministic sea effects, no external samples. Python standard library."""
from pathlib import Path
import base64, json, math, random, struct, wave
ROOT=Path(__file__).resolve().parent.parent/'packs/battleship/assets'
RATE=22050
rng=random.Random(184)
def synth(kind,length):
    frames=[];phase=0;filtered=0
    for i in range(int(RATE*length)):
        t=i/RATE;u=t/length;fade=min(1,t/.015)*min(1,(length-t)/.045)
        noise=rng.uniform(-1,1);filtered=.83*filtered+.17*noise
        if kind=='start':
            phase+=2*math.pi*(520+260*math.sin(2*math.pi*t*2))/RATE
            y=.28*math.sin(phase)+.06*math.sin(phase*2)
        elif kind=='miss':
            y=.5*filtered*math.exp(-u*3)+.12*math.sin(2*math.pi*(210*t-100*t*t))*math.exp(-u*6)
        elif kind=='hit':
            y=.22*noise*math.exp(-u*12)+.26*math.sin(2*math.pi*75*t)*math.exp(-u*7)
        else:
            y=.55*filtered*math.exp(-u*2)+.2*math.sin(2*math.pi*(95*t-38*t*t))*math.exp(-u*3)
        frames.append(struct.pack('<h',int(max(-.9,min(.9,y*fade))*32767)))
    path=ROOT/(kind+'.wav')
    with wave.open(str(path),'wb') as f:f.setparams((1,2,RATE,0,'NONE','not compressed'));f.writeframes(b''.join(frames))
    return path
sounds={}
for kind,length,label in [('start',.65,'Короткая сирена'),('miss',.32,'Всплеск'),('hit',.22,'Попадание'),('sunk',.58,'Потопление')]:
    p=synth(kind,length);sounds['sea.'+kind]={'label':label,'src':'data:audio/wav;base64,'+base64.b64encode(p.read_bytes()).decode()}
(ROOT.parent/'sounds.js').write_text('(function(root){root.PlayroomCatalog ||= {};root.PlayroomCatalog.battleship ||= {};root.PlayroomCatalog.battleship.sounds='+json.dumps(sounds,ensure_ascii=False)+';})(globalThis);\n')
