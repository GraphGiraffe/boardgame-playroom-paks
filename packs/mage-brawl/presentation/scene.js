(function(r,f){const a=f();if(typeof module==='object'&&module.exports)module.exports=a;r.PlayroomPackPresentation=a;})(globalThis,function(){
 const message=(key,params={})=>({key:'mage-brawl.'+key,params});
 const metadata={name:message('meta.name'),description:message('meta.description'),scoreLabel:message('meta.score-label'),presets:[{id:'classic',label:message('meta.classic'),description:message('modes.classic')}],rules:Array.from({length:9},(_,i)=>message('rules.'+(i+1))),botSettings:{strategies:['aggressor','fighter','mind','tactician','defender','random'].map(id=>({id,label:message('bot.'+id),description:message('bot.'+id+'.description')}))}};
 const action=c=>message('actions.'+c.type),event=e=>({message:message('events.'+e.type.split('.').at(-1)),kind:e.type.endsWith('revealed')?'play':'action'}),metric=()=>message('metric.survival');
 const choice=(c,p)=>c.type==='loot'?{targetKind:'player',targetChoice:'card',target:p.data.loot.victim,cardIndex:c.index,targetCardShape:'square'}:{};
 function healthMetric(v,config={}){return {id:'health',kind:'points',value:v.health,label:message('ui.health'),placement:'score',resultUsage:false,display:{icon:'heart',capacity:config?.health||3,overlap:true}};}
 function playerMetrics(v,config={}){return [{id:'kills',kind:'points',value:v.kills,label:message('ui.kills'),placement:'score',resultUsage:false},...(v.ultimate>0?[{id:'ultimate',kind:'points',value:v.ultimate,label:message('ui.ultimate'),placement:'score',resultUsage:false,display:{icon:'crown',capacity:1}}]:[]),...((config?.lives||2)>1?[{id:'lives',kind:'points',value:Math.max(0,v.lives-1),label:message('ui.reserve-life'),placement:'score',resultUsage:false,display:{icon:'meeple',capacity:Math.max(1,(config?.lives||2)-1)}}]:[]),healthMetric(v,config)];}
 function scene(p){const d=p.data;return {arena:{size:d.size,board:d.board,inset:d.inset,phase:d.phase,shrink:d.shrink,startingBases:d.startingBases,config:d.config,players:d.players,window:d.window,loot:d.loot,previews:d.previews,planned:d.planned,frames:d.frames,shields:d.shields},plan:presentationPlan(d),contractVersion:1,id:'mage-arena',family:'board',round:{number:p.data.round,limit:null,starts:p.timeline?.roundStarts||[0]},players:p.data.players.map((v,player)=>({player,botSettings:{...v.bot},handCount:v.maxHand,showHand:false,countLabel:message('ui.hand-limit'),metrics:playerMetrics(v,p.data.config)}))};}

 // Presentation groups public snapshots; it never resolves or reorders rules.
 function phaseGroups(raw=[]){
  const groups=[];
  for(let i=0;i<raw.length;){
   const first=raw[i];if(!/^(movement|attack)-|^shrink$/.test(first.phase)){i++;continue;}
   let end=i+1;while(end<raw.length&&raw[end].phase===first.phase&&raw[end].step===first.step)end++;
   const frames=raw.slice(i,end),motions=new Map();
   for(const frame of frames)for(const motion of frame.motions||[]){const old=motions.get(motion.player);motions.set(motion.player,{...motion,from:old?.from||motion.from});}
   groups.push({id:'phase:'+i,phase:first.phase,step:first.step||0,previous:raw[i-1]||raw[0],last:frames.at(-1),effects:frames.flatMap(frame=>frame.effect?[frame.effect]:[]),motions:[...motions.values()]});
   i=end;
  }
  return groups;
 }
 // Public snapshots and semantic cues are produced before any renderer runs.
 function presentationPlan(d){
  const publicState={board:d.board,inset:d.inset,phase:d.phase,shrink:d.shrink,
   players:d.players.map(v=>({pos:v.pos,health:v.health,lives:v.lives,maxHand:v.maxHand,kills:v.kills,ultimate:v.ultimate,handCount:v.handCount}))};
  const raw=d.frames||[],scenes=[],groups=[];
  const add=(scene,duration,cues=[])=>{const index=scenes.length;scenes.push(scene);groups.push({scene:index,duration,cues});};
  if(raw.length)add({kind:'start',state:raw[0]},250);
  for(const phase of phaseGroups(raw)){
   const {id,effects,previous,last,motions}=phase;
   if(effects.length)add({kind:'reveal',phase:phase.phase,step:phase.step,effects,state:{...previous,outcomes:[],motions:[],effect:null}},750,
    effects.map((effect,i)=>({id:id+':reveal:'+i,kind:'reveal',target:{entity:{namespace:'mage',id:String(effect.actor)}},element:effect.element,action:effect.action})));
   const cues=[...motions.map((motion,i)=>({id:id+':move:'+i,kind:'movement',target:{entity:{namespace:'mage',id:String(motion.player)}},...motion})),
    ...effects.filter(e=>e.action!=='movement').map((effect,i)=>({id:id+':attack:'+i,kind:'attack',target:{entity:{namespace:'mage',id:String(effect.actor)}},...effect})),
    ...(last.outcomes||[]).flatMap((outcome,i)=>{
     const target={entity:{namespace:'mage',id:String(outcome.player)}},prefix=id+':outcome:'+i;
     return [...(outcome.damage>0?[{id:prefix+':damage',kind:'damage',target,amount:outcome.damage}]:[]),
      ...(outcome.fall?[{id:prefix+':fall',kind:'fall',target,at:outcome.at}]:[]),
      ...(outcome.death?[{id:prefix+':death',kind:'death',target}]:[]),
      ...(outcome.killers||[]).map((player,j)=>({id:prefix+':kill:'+j,kind:'kill',target:{entity:{namespace:'mage',id:String(player)}},victim:target.entity}))];
    })];
   add({kind:'effects',phase:phase.phase,step:phase.step,effects,state:{...last,effect:null,effects,motions}},650,cues);
  }
  const final=scenes.length;scenes.push({kind:'live',state:publicState});
  return {id:'mage:'+d.round+':'+JSON.stringify(raw[0]?.board||[]),initial:0,final,scenes,groups};
 }
 // Geometry contains only public identities from the authorized projection.
 function sceneLayout(p){const d=p.data;return {geometry:{topology:'grid:'+d.size+':'+d.inset},zones:[{id:'field',kind:'board'},...d.players.map((v,owner)=>({id:'hand-'+owner,kind:'hand',owner,count:v.handCount}))],objects:d.players.flatMap((v,owner)=>[...(v.pos?[{ref:{namespace:'mage',id:String(owner)},zone:'field',owner,point:v.pos}]:[]),...(v.hand||[]).map((card,index)=>({ref:{namespace:'card',id:card.id},zone:'hand-'+owner,index}))]),interactions:p.actions.map(command=>({command,target:command.cardId?{entity:{namespace:'card',id:command.cardId}}:{zone:'field'}}))};}
 return Object.freeze({metadata,action,choice,event,metric,scene:p=>({...scene(p),...sceneLayout(p)}),playerMetrics,healthMetric,phaseGroups,presentationPlan,message});
});
