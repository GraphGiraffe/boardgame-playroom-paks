// Deterministic solitaire rules. The host owns revision, persistence and input.
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomPackDomain||={};root.PlayroomPackDomain.solitaire=api;})(globalThis,function(){
 'use strict';
 const copy=v=>JSON.parse(JSON.stringify(v)),rank=c=>c.rank===14?1:c.rank,red=c=>['♥','♦'].includes(c.suit);
 const stateKeys=['tableau','stock','waste','foundations','completed','passes','score'];
 function factory(id,ports,Deck){
  const spider=id==='spider',count=spider?104:52;
  const deck=suits=>spider?Array.from({length:104},(_,i)=>({id:'spider-'+i,rank:2+i%13,suit:(suits===1?['♠']:suits===2?['♠','♥']:Deck.suits)[Math.floor(i/13)%suits],open:false})):Deck.create(52).map(c=>({...c,open:false}));
  function create({playerCount,rng,options={}}){
   if(playerCount!==1)throw Error('SOLITAIRE_REQUIRES_ONE_PLAYER');
   const config=spider?{suits:Number(options.suits??1),scoring:options.scoring??'standard',emptyDeal:options.emptyDeal==='allow',undo:options.undo??'last'}:{draw:Number(options.draw??3),scoring:options.scoring??'standard',maxPasses:Number(options.maxPasses??0),autoFlip:(options.autoFlip??'auto')==='auto',undo:options.undo??'last',autoCollect:(options.autoCollect??'button')==='button'};
   if(spider?![1,2,4].includes(config.suits):![1,3].includes(config.draw)||![0,1,3].includes(config.maxPasses))throw Error('SOLITAIRE_OPTIONS_INVALID');
   if(!['standard','none',...(spider?[]:['vegas'])].includes(config.scoring)||!['off','last','history'].includes(config.undo))throw Error('SOLITAIRE_OPTIONS_INVALID');
   if(config.scoring==='vegas')config.maxPasses=config.draw===1?1:3;
   const p={playerCount:1,turn:0,status:'playing',winners:[],rng,data:{}},cards=ports.shuffle(deck(config.suits),p),tableau=Array.from({length:spider?10:7},(_,i)=>Array.from({length:spider?(i<4?6:5):i+1},()=>cards.pop()));
   tableau.forEach(col=>col.at(-1).open=true);
   p.data={config,tableau,stock:cards,waste:[],foundations:[[],[],[],[]],completed:[],passes:1,score:spider?500:config.scoring==='vegas'?-52:0,moves:0,undos:0,history:[]};return p;
  }
  function validBoard(d,config){
   if(!d||!Array.isArray(d.tableau)||d.tableau.length!==(spider?10:7)||!d.tableau.every(Array.isArray)||!Array.isArray(d.stock)||!Array.isArray(d.waste)||!Array.isArray(d.foundations)||d.foundations.length!==4||!d.foundations.every(Array.isArray)||!Array.isArray(d.completed)||!d.completed.every(Array.isArray)||!Number.isSafeInteger(d.score)||!Number.isSafeInteger(d.passes)||d.passes<1)return false;
   const all=[...d.tableau,d.stock,d.waste,...d.foundations,...d.completed].flat(),known=new Map(deck(config.suits).map(c=>[c.id,c]));
   if(all.length!==count||new Set(all.map(c=>c?.id)).size!==count||!all.every(c=>{const face=known.get(c?.id);return face&&c.rank===face.rank&&c.suit===face.suit&&typeof c.open==='boolean'&&Object.keys(c).sort().join(',')==='id,open,rank,suit';}))return false;
   if(d.stock.some(c=>c.open)||d.waste.some(c=>!c.open)||d.tableau.some(col=>col.some((c,i)=>!c.open&&col.slice(0,i).some(x=>x.open))))return false;
   if(spider){if(d.waste.length||d.foundations.some(x=>x.length)||d.stock.length%10||d.stock.length>50||d.completed.length>8)return false;
    if(d.completed.some(col=>col.length!==13||col.some((c,i)=>!c.open||rank(c)!==13-i||c.suit!==col[0].suit)))return false;
   }else if(d.completed.length||d.foundations.some(col=>col.length>13||col.some((c,i)=>!c.open||rank(c)!==i+1||c.suit!==col[0].suit))||new Set(d.foundations.filter(c=>c.length).map(c=>c[0].suit)).size!==d.foundations.filter(c=>c.length).length)return false;
   return true;
  }
  function validate(p){const d=p.data,c=d?.config;if(!c||p.playerCount!==1||p.turn!==0||!Number.isSafeInteger(p.rng)||p.rng<0||p.rng>4294967295||!['standard','none',...(spider?[]:['vegas'])].includes(c.scoring)||!['off','last','history'].includes(c.undo))return false;
   if(spider?![1,2,4].includes(c.suits)||typeof c.emptyDeal!=='boolean':![1,3].includes(c.draw)||![0,1,3].includes(c.maxPasses)||typeof c.autoFlip!=='boolean'||typeof c.autoCollect!=='boolean'||c.scoring==='vegas'&&c.maxPasses!==(c.draw===1?1:3))return false;
   const won=spider?d.completed?.length===8:d.foundations?.reduce((n,c)=>n+c.length,0)===52;
   return validBoard(d,c)&&Number.isSafeInteger(d.moves)&&d.moves>=0&&Number.isSafeInteger(d.undos)&&d.undos>=0&&Array.isArray(d.history)&&d.history.length<=100&&d.history.every(b=>validBoard(b,c))&&(p.status==='finished')===won&&JSON.stringify(p.winners)===JSON.stringify(won?[0]:[]);
  }
  function sequence(col,index){return col[index]?.open&&col.slice(index).every((c,i,a)=>!i||c.open&&rank(a[i-1])===rank(c)+1&&(spider?a[i-1].suit===c.suit:red(a[i-1])!==red(c)));}
  function commands(p){
   const d=p.data,out=[];if(p.status!=='playing')return out;
   const sources=[];d.tableau.forEach((col,from)=>{col.forEach((c,index)=>{if(sequence(col,index))sources.push({source:'tableau',from,index,card:c.id,c,n:col.length-index});});if(col.length&&!col.at(-1).open)out.push({type:'flip',from});});
   if(!spider){if(d.waste.length){const c=d.waste.at(-1);sources.push({source:'waste',from:0,index:d.waste.length-1,card:c.id,c,n:1});}d.foundations.forEach((col,from)=>{if(col.length){const c=col.at(-1);sources.push({source:'foundation',from,index:col.length-1,card:c.id,c,n:1});}});}
   for(const {source,from,index,card,c,n}of sources){
    d.tableau.forEach((col,to)=>{if(source==='tableau'&&from===to)return;const top=col.at(-1);if(top?top.open&&rank(top)===rank(c)+1&&(spider||red(top)!==red(c)):spider||rank(c)===13)out.push({type:'move',source,from,index,card,target:'tableau',to});});
    if(!spider&&n===1&&source!=='foundation')d.foundations.forEach((col,to)=>{const top=col.at(-1);if(top?top.suit===c.suit&&rank(c)===rank(top)+1:rank(c)===1)out.push({type:'move',source,from,index,card,target:'foundation',to});});
   }
   if(d.stock.length&&(!spider||d.config.emptyDeal||d.tableau.every(col=>col.length)))out.push({type:'draw'});
   if(!spider&&!d.stock.length&&d.waste.length&&(!d.config.maxPasses||d.passes<d.config.maxPasses))out.push({type:'recycle'});
   if(d.history.length&&d.config.undo!=='off')out.push({type:'undo'});
   if(!spider&&d.config.autoCollect&&out.some(a=>a.target==='foundation'))out.push({type:'collect'});
   return out;
  }
  function actions(p,actor){return actor===0?commands(p).map(command=>({command,visibility:'public'})):[];}
  function score(d,amount){if(d.config.scoring==='none')d.score=0;else if(d.config.scoring==='standard')d.score=Math.max(0,d.score+amount);else d.score+=amount;}
  function stable(d){for(const col of d.tableau){let again=true;while(again){again=false;if(col.length&&!col.at(-1).open&&(spider||d.config.autoFlip)){col.at(-1).open=true;if(!spider&&d.config.scoring==='standard')score(d,5);}if(spider&&col.length>=13){const tail=col.slice(-13);if(tail.every((c,i)=>c.open&&rank(c)===13-i&&c.suit===tail[0].suit)){d.completed.push(col.splice(-13));score(d,100);again=true;}}}}}
  function move(d,a){const src=a.source==='tableau'?d.tableau[a.from]:a.source==='waste'?d.waste:d.foundations[a.from],cards=src.splice(a.index);(a.target==='tableau'?d.tableau[a.to]:d.foundations[a.to]).push(...cards);
   if(!spider){if(d.config.scoring==='vegas')score(d,a.target==='foundation'?5:a.source==='foundation'?-5:0);else if(d.config.scoring==='standard')score(d,a.target==='foundation'?10:a.source==='foundation'?-15:a.source==='waste'?5:0);}
  }
  function reduce(p,actor,a){
   if(actor!==0||!commands(p).some(c=>JSON.stringify(c)===JSON.stringify(a)))throw Error('SOLITAIRE_ACTION_UNAVAILABLE');
   const next=copy(p),d=next.data,transfers=[];
   if(a.type==='undo'){const before=d.history.pop(),moves=d.moves+1,undos=d.undos+1;Object.assign(d,before);d.moves=moves;d.undos=undos;score(d,spider?-1:-2);}
   else{const before=Object.fromEntries(stateKeys.map(k=>[k,copy(d[k])]));
    if(a.type==='move')move(d,a);
    if(a.type==='flip'){d.tableau[a.from].at(-1).open=true;if(!spider&&d.config.scoring==='standard')score(d,5);}
    if(a.type==='draw'){if(spider)d.tableau.forEach(col=>{const c=d.stock.pop();c.open=true;col.push(c);});else for(let i=0;i<d.config.draw&&d.stock.length;i++){const c=d.stock.pop();c.open=true;d.waste.push(c);}}
    if(a.type==='recycle'){d.stock=d.waste.reverse().map(c=>({...c,open:false}));d.waste=[];d.passes++;if(d.config.scoring==='standard')score(d,d.config.draw===1?-100:d.passes>3?-20:0);}
    if(a.type==='collect'){let m;while((m=commands(next).find(c=>c.target==='foundation'))){const col=m.source==='waste'?d.waste:d.tableau[m.from],card=copy(col[m.index]);transfers.push({card,from:m.source==='waste'?'waste':'tableau-'+m.from+'-'+m.index,to:'home-'+card.suit});move(d,m);stable(d);}}
    if(spider)score(d,-1);stable(d);d.moves++;
    if(d.config.undo!=='off')d.history=(d.config.undo==='last'?[]:d.history).concat([before]).slice(-100);
   }
   const won=spider?d.completed.length===8:d.foundations.reduce((n,c)=>n+c.length,0)===52;
   if(won){next.status='finished';next.winners=[0];}
   const events=[{type:id+'.'+a.type,actor,params:transfers.length?{transfers}:a.card?{card:a.card}:{},visibility:{kind:'public'}}];if(won)events.push({type:id+'.finished',actor,params:{},visibility:{kind:'public'}});
   return {position:next,events,turnEnded:false};
  }
  function hints(p){
   const d=p.data,available=commands(p),previous=d.history.at(-1),home=suit=>rank(d.foundations.find(col=>col[0]?.suit===suit)?.at(-1)||{rank:0});
   const useful=available.filter(a=>{
    if(a.type==='flip')return true;if(a.type!=='move'||a.source==='foundation')return false;
    const col=a.source==='waste'?d.waste:d.tableau[a.from],card=col[a.index],r=rank(card);
    if(a.target==='foundation')return r<=2||['♠','♥','♦','♣'].filter(suit=>red({suit})!==red(card)).every(suit=>home(suit)>=r-1);
    const target=d.tableau[a.to],below=col[a.index-1];
    if(a.source==='tableau'&&a.index===0&&!target.length)return false;
    if(previous&&a.source==='tableau'){const ids=cards=>JSON.stringify(cards.map(c=>c.id));if(ids(previous.tableau[a.from])===ids(col.slice(0,a.index))&&ids(previous.tableau[a.to])===ids(target.concat(col.slice(a.index))))return false;}
    if(a.source==='waste'||a.index===0||below&&!below.open)return true;
    if(spider){
     const sourceJoined=below?.open&&below.suit===card.suit&&rank(below)===r+1,targetJoined=target.at(-1)?.suit===card.suit;
     let run=0;
     for(let i=target.length-1;i>=0;i--){const c=target[i];if(!c.open||c.suit!==card.suit||rank(c)!==r+1+run)break;run++;}
     // Moving a ready tail between equivalent parents gains no suited link.
     // Completing a K–A run still matters even when the old parent is suited.
     return run+col.length-a.index>=13||targetJoined&&!sourceJoined;
    }
    return below&&home(below.suit)===rank(below)-1;
   });
   useful.sort((a,b)=>(a.type==='flip'?0:a.target==='foundation'?1:2)-(b.type==='flip'?0:b.target==='foundation'?1:2));
   return useful.length?useful:available.filter(a=>a.type==='draw'||a.type==='recycle');
  }
  function project(p){const d=copy(p.data);d.hints=hints(p);d.dragSources=d.tableau.flatMap(col=>col.filter((c,i)=>sequence(col,i)).map(c=>c.id));if(!spider)d.dragSources.push(...d.waste.slice(-1).map(c=>c.id),...d.foundations.flatMap(col=>col.slice(-1).map(c=>c.id)));delete d.history;d.canUndo=p.data.history.length>0;d.stock=d.stock.map(()=>({hidden:true}));d.tableau=d.tableau.map(col=>col.map(c=>c.open?c:{hidden:true}));return d;}
  function result(p){const d=p.data,cleared=spider?d.completed.length:d.foundations.reduce((n,c)=>n+c.length,0);return {winners:p.winners,places:[1],metrics:[...(d.config.scoring==='none'?[]:[{id:'score',values:[d.score]}]),{id:'cleared',values:[cleared]},{id:'moves',values:[d.moves]}]};}
  function localChoices(p){return p.actor===0?actions({...p,data:{...p.data,history:p.data.canUndo?[{}]:[]}},0):[];}
  return Object.freeze({contractVersion:1,id,minPlayers:1,maxPlayers:1,create,validate,actions,localChoices,reduce,project,result,score:p=>[Math.max(0,p.data.score)]});
 }
 return Object.freeze({factory});
});
