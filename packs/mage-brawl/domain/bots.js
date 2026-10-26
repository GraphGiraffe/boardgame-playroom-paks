// Port of prototype/arena_game/bots.py profiles and tactical features.
(function(r,f){if(typeof require==='function'&&!r.PlayroomPack)module.exports=f(require('../../../shared/domain/bot-policy.js'));r.MageBrawlBotsFactory=f;})(globalThis,function(B){
 const profiles={aggressor:[.85,.10,3,.4,4,.50],fighter:[.85,.35,2.4,1.2,7,.50],mind:[.60,.55,1.5,1.7,7,1],tactician:[.60,.45,1.5,1.5,7,.50],defender:[.28,.72,-.8,3,2,.75],random:[1/3,1/3,1,1,1,.25]};
 const dirs=[[-1,0],[0,1],[1,0],[0,-1]],add=(a,b)=>a.map((n,i)=>n+b[i]),distance=(a,b)=>Math.abs(a[0]-b[0])+Math.abs(a[1]-b[1]),same=(a,b)=>!!a&&!!b&&a.every((n,i)=>n===b[i]);
 function choose(projection,actor,commands,R,context={}){
  if(!commands.length)return null;const d=projection.data,me=d.players[actor],name=me.bot.resolvedStrategy,[ap,dp,approach,safety,finishing,baseCount]=profiles[name],level=me.bot.difficulty||context.difficulty||'medium',count=baseCount*({easy:.25,medium:.65,hard:1}[level]);
  const rng=B.random(context.seed??1,d.window.id+':'+actor),pick=a=>a[Math.floor(rng()*a.length)],best=pairs=>{const m=Math.max(...pairs.map(p=>p[0]));return pick(pairs.filter(p=>p[0]===m))[1];};
  const enemies=d.players.flatMap((p,i)=>i!==actor&&p.pos?[{...p,id:i}]:[]),prob=(id,e)=>{const total=4*(d.config?.copies||d.players.length+1)-me.hand.length,available=(d.config?.copies||d.players.length+1)-me.hand.filter(x=>x.element===e).length,n=Math.min(d.players[id].handCount,total);let none=1;for(let i=0;i<n;i++)none*=Math.max(0,total-available-i)/(total-i);return 1-none;};
  const immune=(p,e)=>R.terrain[R.tile(d,p.pos)]?.[1]===e,loss=p=>p.lives>1?2+3*count*(p.handCount>1)-.75*safety:4+5*Math.min(1,p.ultimate);
  function threats(source,target,ult){const y=Math.abs(source[0]-target[0]),x=Math.abs(source[1]-target[1]),dist=y+x,out=[];if(dist===1)out.push('air','earth');if(y===1&&x===1&&ult)out.push('air');if(y&&x)return out;const v=[Math.sign(target[0]-source[0]),Math.sign(target[1]-source[1])];for(let i=1;i<dist;i++)if(R.tile(d,add(source,v.map(x=>x*i)))==='wall')return out;out.push('fire');if(dist<=2)out.push('water');if(ult)out.push('earth');return out;}
  function danger(pos){return enemies.reduce((sum,p)=>{const n=distance(pos,p.pos);return sum+(n<=1?4:n<=2?2:p.pos[0]===pos[0]||p.pos[1]===pos[1]?1:0)+(p.ultimate&&threats(p.pos,pos,p.ultimate).length?1+Math.min(2,p.ultimate):0);},R.ring(d,pos)?2:0);}
  if(commands[0].type==='loot')return pick(commands);
  if(commands[0].type==='respawn'){
   const near=p=>enemies.length?Math.min(...enemies.map(e=>distance(p,e.pos))):0,score=c=>name==='aggressor'?-near(c.pos):name==='fighter'?-danger(c.pos)*100-near(c.pos):name==='defender'?near(c.pos):near(c.pos)-3*R.ring(d,c.pos);
   const selected=name==='random'||!enemies.length?pick(commands):commands.reduce((a,b)=>score(a)>=score(b)?a:b);
   return B.mistake(selected,commands,{rate:me.bot.errorRate,random:rng,score,safe:()=>true,meaningful:()=>true});
  }
  if(commands[0].type==='unready')return commands[0];
  const target=enemies.length?enemies.reduce((a,b)=>priority(a)<=priority(b)?a:b):null;
  function priority(p){return distance(me.pos,p.pos)+count*prob(p.id,'earth')-((d.config?.health||3)-p.health)*finishing/(d.config?.health||3)-(p.lives===1)-Math.min(2,p.ultimate)*(1+finishing/4)-(p.lives>1&&p.handCount>1?count:0);}
  function targets(c){const cells=R.geometry(d,actor,c);if(c.element==='fire'&&c.action==='ultimate'&&cells.length){const id=R.occupant(d,cells[0]);if(id>=0&&immune(d.players[id],'fire'))return [];}
   const ids=[...new Set(cells.map(p=>R.occupant(d,p)).filter(i=>i>=0&&i!==actor))].sort((a,b)=>distance(me.pos,d.players[a].pos)-distance(me.pos,d.players[b].pos)),out=[];
   for(const id of ids){if(!immune(d.players[id],c.element))out.push(id);else if(c.element==='water')break;}return out;
  }
  const damage=(p,c)=>immune(p,c.element)?0:({air:0,earth:2,water:1,fire:1}[c.element]+(R.terrain[R.tile(d,p.pos)]?.[0]===c.element?1:0));
  const airDest=(p,c)=>add(p.pos,c.action==='ultimate'?p.pos.map((v,i)=>Math.sign(v-me.pos[i])):dirs[c.direction]);
  const canFinish=c=>targets(c).some(id=>damage(d.players[id],c)>=d.players[id].health||(c.element==='air'&&!R.tile(d,airDest(d.players[id],c))));
  function attack(c){const ids=targets(c);if(!ids.length)return 0;let score=0;for(const id of ids){const p=d.players[id],n=damage(p,c);score+=3+n*2+2*count*(1-prob(id,'earth'));if(n>=p.health)score+=finishing+loss(p);if(c.element==='air'){const q=airDest(p,c),tile=R.tile(d,q);score+=!tile?20+loss(p):tile==='wall'?8+(p.health<=1?finishing+loss(p):0):tile==='spikes'?5+(p.health<=1?finishing+loss(p):0):d.shrink&&R.ring(d,q)?10:2;}}
   if(c.action==='ultimate'){score-=2.5/me.ultimate;if(c.element==='water')score+=me.health<(d.config?.health||3)?4:-2;else if(c.element==='fire'){const impact=R.geometry(d,actor,c)[0];if(impact&&distance(impact,me.pos)===1)score-=6;}}return score;
  }
  function train(c){if(c.element!=='water')return {members:[],end:null};const v=dirs[c.direction];let pos=add(me.pos,v);const members=[];for(let i=0;i<d.size;i++){const id=R.occupant(d,pos);if(id<0)break;members.push(d.players[id]);pos=add(pos,v);}return {members,end:pos};}
  function pushValue(c){const t=train(c);if(!t.members.length)return 0;const tile=R.tile(d,t.end),p=t.members.at(-1);return tile==='wall'?t.members.reduce((n,p)=>n+4+(p.health<=1?finishing+loss(p):0),0):!tile?12+loss(p):tile==='spikes'?5+(p.health<=1?finishing+loss(p):0):d.shrink&&R.ring(d,t.end)?7:1;}
  function preview(c){const q=R.geometry(d,actor,c)[0],tile=R.tile(d,q),id=R.occupant(d,q);if(!tile)return null;if(tile==='wall')return me.pos;if(id>=0&&c.element!=='water')return me.pos;if(id>=0&&c.element==='water'){if(R.tile(d,train(c).end)==='wall')return me.pos;if(tile==='falling_floor')return null;}return q;}
  function terrainScore(q){const t=R.terrain[R.tile(d,q)];if(!t)return 0;const possible=new Set(),probs={};for(const p of enemies){if(same(p.pos,q))continue;for(const e of threats(p.pos,q,p.ultimate)){possible.add(e);probs[e]=Math.max(probs[e]||0,prob(p.id,e));}}const risk=e=>(1-count)*(possible.has(e)?1:0)+count*(probs[e]||0);return safety*(3*risk(t[1])-4*risk(t[0]));}
  function movement(c){const q=preview(c);if(!q)return -1000;const push=pushValue(c);if(same(q,me.pos))return push>0?push:-200;let score=target?(distance(me.pos,target.pos)-distance(q,target.pos))*approach:0;const tile=R.tile(d,q),edge=R.ring(d,q);if(tile==='spikes')score-=8*safety;if(tile==='falling_floor')score-=2*safety;if(edge)score-=safety;if(d.shrink){if(R.ring(d,me.pos)&&!edge)score+=100;else if(edge)score-=100;}if(name==='fighter')score+=safety*(danger(me.pos)-danger(q));if(c.element==='water'&&R.occupant(d,add(me.pos,dirs[c.direction]))>=0)score+=['aggressor','fighter','tactician','mind'].includes(name)?5:-2;return score+push+terrainScore(q)+5;}
  function shield(c){let threat=0;for(const p of enemies){const es=threats(p.pos,me.pos,p.ultimate);if(!es.length||!R.shielded({[actor]:c.direction},actor,me.pos.map((v,i)=>v-p.pos[i])))continue;const expected=es.reduce((n,e)=>n+prob(p.id,e),0);threat+=(es.length*(1-count)+expected*count)*(1+.5*Math.min(2,p.ultimate))/Math.max(1,distance(p.pos,me.pos));}return threat?threat*4+danger(me.pos)*safety+(4-me.health):0;}
  const score=c=>c.action!=='movement'?attack(c):c.element==='earth'?shield(c):movement(c),attacks=commands.filter(c=>c.action!=='movement').map(c=>[score(c),c]).filter(p=>p[0]>0),shields=commands.filter(c=>c.action==='movement'&&c.element==='earth').map(c=>[score(c),c]).filter(p=>p[0]>0),moves=commands.filter(c=>c.action==='movement'&&c.element!=='earth').map(c=>[score(c),c]).filter(p=>p[0]>-100);
  function normal(){if(!enemies.length)return pick(commands);if(d.shrink&&R.ring(d,me.pos)){const escape=moves.filter(([,c])=>{const p=preview(c);return p&&!R.ring(d,p);});if(escape.length)return best(escape);}if(name==='random'){const groups=[attacks,shields,moves].filter(a=>a.length);return groups.length?best(pick(groups)):pick(commands);}const risk=danger(me.pos);
   if(name==='fighter'){const finishing=attacks.filter(([,c])=>canFinish(c));if(finishing.length)return best(finishing);if(me.health===1&&risk>=4&&shields.length)return best(shields);}
   if(['aggressor','fighter'].includes(name)){if(attacks.length&&rng()<ap)return best(attacks);for(const a of [moves,attacks,shields])if(a.length)return best(a);return pick(commands);}
   if(['mind','tactician'].includes(name)){const meaningful=[...attacks,...shields,...moves];return meaningful.length?best(meaningful):pick(commands);}
   if(name==='defender'&&risk>0){const candidates=[...shields,...attacks.map(([s,c])=>[s+finishing,c])];if(candidates.length)return best(candidates);}
   if(attacks.length&&rng()<ap)return best(attacks);if(shields.length&&risk>0&&rng()<dp)return best(shields);for(const a of [moves,attacks,shields])if(a.length)return best(a);return pick(commands);
  }
  const safe=c=>{if(d.shrink&&R.ring(d,me.pos)&&(c.action!=='movement'||c.element==='earth'))return false;if(c.action!=='movement')return !(c.action==='ultimate'&&c.element==='fire'&&damage(me,c)>=me.health&&R.geometry(d,actor,c).some(q=>same(q,me.pos)));if(c.element==='earth')return !(d.shrink&&R.ring(d,me.pos));const q=preview(c);return q&&!(R.tile(d,q)==='spikes'&&me.health===1)&&!(d.shrink&&R.ring(d,q));};
  return B.mistake(normal(),commands,{rate:me.bot.errorRate,random:rng,score,safe,meaningful:c=>c.action==='movement'?(c.element==='earth'?shield(c)>0:!!preview(c)&&(!same(preview(c),me.pos)||pushValue(c)>0)):targets(c).length>0});
 }
 return Object.freeze({profiles,choose});
});
