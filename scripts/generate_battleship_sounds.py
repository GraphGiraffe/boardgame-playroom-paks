"""Original deterministic sea effects, no external samples. Python standard library."""
from pathlib import Path
import argparse, math, random, struct, wave
RATE=22050
def synth(kind,length,rng,path):
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
    with path.open('xb') as stream, wave.open(stream,'wb') as output:
        output.setparams((1,2,RATE,0,'NONE','not compressed'))
        output.writeframes(b''.join(frames))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', type=Path, required=True)
    output_dir = parser.parse_args().output_dir
    output_dir.mkdir(parents=True, exist_ok=True)
    # Keep this order: all four masters use the same deterministic noise stream.
    rng = random.Random(184)
    for kind, length in [('start', .65), ('miss', .32), ('hit', .22), ('sunk', .58)]:
        synth(kind, length, rng, output_dir / (kind + '.wav'))
