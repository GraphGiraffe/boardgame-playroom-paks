// @ts-check
/** @typedef {import('../sdk/contracts').Position} Position */
/** @typedef {import('../sdk/contracts').JSONValue} JSONValue */
/** @typedef {{id:string,text:string,actor:number}} Guess */
/** @typedef {{mode:string,answerMode:string,difficulty:string,durationSeconds:number,roundLimit:number,cycles:number,hostPlayer:number,stopQuorum:number,noErase:boolean,strokeBudget:number,quickGuessBonus:boolean}} Settings */
/** @typedef {{phase:string,deadline:number,drawingStart:number,roundId:number,cycle:number,artist:number,remaining:number[],answer:string,operations:JSONValue[],guesses:Guess[],scores:number[],winner:number,accepted:string,manual:boolean,award:number,protests:number[],protested:boolean,stopVotes:number[],voteDeadline:number,stopRequested:boolean,settings:Settings}} Data */
/** @typedef {Position & {data:Data}} State */
const banks={
 easy:['кот','дом','солнце','зонт','мяч','рыба','дерево','чашка','мост','ключ','торт','ракета','чайник','корабль','гриб','яблоко','снеговик','карандаш','велосипед','бабочка'],
 medium:['водопад','библиотека','карусель','подводник','будильник','пылесос','светофор','телескоп','остров','паровоз','аквариум','палатка','вертолёт','крокодил','почтальон','маяк','рюкзак','самовар','фонтан','пингвин'],
 hard:['невесомость','равновесие','вдохновение','ностальгия','эволюция','парадокс','телепортация','гравитация','дружба','терпение','воображение','бесконечность','эхо','мираж','интуиция','свобода','совпадение','путешествие','тишина','изобретение']
};
/** @param {Position} p @returns {State} */
function state(p){return /** @type {State} */ (p);}
/** @param {number} count */
function quorum(count){return SDK.voteThreshold(count);}
/** @param {string} text */
function normal(text){return text.trim().toLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ');}
/** @param {State} p @param {number} length */
function random(p,length){p.rng=(Math.imul(p.rng||0,1664525)+1013904223)>>>0;return p.rng%length;}
/** @param {State} p @param {number[]} pool */
function pick(p,pool){return pool[random(p,pool.length)];}
/** @param {State} p */
function word(p){const list=banks[/** @type {keyof typeof banks} */(p.data.settings.difficulty)];return list[random(p,list.length)];}
/** @param {number} n */
function players(n){return Array.from({length:n},(_,i)=>i);}
/** @param {State} p @param {number} artist @param {number} now */
function startRound(p,artist,now){const d=p.data;d.roundId++;d.artist=artist;p.turn=artist;d.remaining=d.remaining.filter(v=>v!==artist);d.phase='prepare';d.deadline=now+3000;d.drawingStart=d.deadline;d.answer=word(p);d.operations=[];d.guesses=[];d.winner=-1;d.accepted='';d.manual=false;d.award=0;d.protests=[];d.protested=false;}
/** @param {State} p @param {number} winner @param {string} accepted @param {boolean} manual @param {number} now */
function endRound(p,winner,accepted,manual,now){const d=p.data;d.phase='result';d.deadline=now+12000;d.winner=winner;d.accepted=accepted;d.manual=manual;d.award=winner<0?0:1+(d.settings.quickGuessBonus&&now-d.drawingStart<10000?1:0);if(winner>=0)d.scores[winner]+=d.award;}
/** @param {State} p */
function finish(p){p.status='finished';p.data.phase='finished';const best=Math.max(...p.data.scores);p.winners=players(p.playerCount).filter(i=>p.data.scores[i]===best);}
/** @param {State} p @param {number} now */
function nextRound(p,now){const d=p.data,s=d.settings;if(s.mode==='turns'){
 if(!d.remaining.length){if(d.stopRequested||d.cycle>=s.cycles){finish(p);return;}d.cycle++;d.remaining=players(p.playerCount);}
 const artist=d.protested?pick(p,d.remaining):d.remaining[0];startRound(p,artist,now);
 }else{if(d.stopRequested||(s.roundLimit>0&&d.roundId>=s.roundLimit)){finish(p);return;}const pool=players(p.playerCount).filter(i=>i!==d.artist);startRound(p,!d.protested&&d.winner>=0?d.winner:pick(p,pool),now);}}
/** @param {State} p @param {number} actor */
function eligible(p,actor){return actor!==p.data.artist&&actor!==p.data.winner;}
/** @param {State} p @param {number} actor @param {string} type */
function command(p,actor,type){return {type,roundId:p.data.roundId};}
/** @type {import('../sdk/contracts').Definition} */
const definition={
 contractVersion:1,rounds:true,id:'kalyakodil-a',minPlayers:2,maxPlayers:12,
 create(o){const raw=/** @type {{[key:string]:JSONValue}} */(o.options||{}),s={mode:String(raw.mode||'rounds'),answerMode:String(raw.answerMode||'anonymous'),difficulty:String(raw.difficulty||'easy'),durationSeconds:Number(raw.durationSeconds??60),roundLimit:Number(raw.roundLimit??10),cycles:Number(raw.cycles??2),hostPlayer:Number(raw.hostPlayer??0),stopQuorum:quorum(o.playerCount),noErase:raw.noErase===true||raw.noErase==='true',strokeBudget:Number(raw.strokeBudget??0),quickGuessBonus:raw.quickGuessBonus===true||raw.quickGuessBonus==='true'};
 if(!['anonymous','named','oral'].includes(s.answerMode)||!['rounds','turns'].includes(s.mode)||!Object.keys(banks).includes(s.difficulty)||!Number.isInteger(s.durationSeconds)||s.durationSeconds<30||s.durationSeconds>180||![0,10,20,30].includes(s.roundLimit)||!Number.isInteger(s.cycles)||s.cycles<2||s.cycles>5||!Number.isInteger(s.hostPlayer)||s.hostPlayer<0||s.hostPlayer>=o.playerCount||!Number.isInteger(s.stopQuorum)||s.stopQuorum<1||s.stopQuorum>o.playerCount||![0,10,20,30].includes(s.strokeBudget))throw Error('KALY_OPTIONS');
 const now=Number(raw.now??o.now??0);if(!Number.isSafeInteger(now)||now<0)throw Error('KALY_TIME');
 const p=/** @type {State} */({playerCount:o.playerCount,turn:o.firstPlayer,status:'playing',winners:[],rng:o.rng,data:{phase:'prepare',deadline:0,drawingStart:0,roundId:0,cycle:1,artist:o.firstPlayer,remaining:players(o.playerCount),answer:'',operations:[],guesses:[],scores:players(o.playerCount).map(()=>0),winner:-1,accepted:'',manual:false,award:0,protests:[],protested:false,stopVotes:[],voteDeadline:0,stopRequested:false,settings:s}});startRound(p,o.firstPlayer,now);return p;},
 validate(p){const d=state(p).data;return p.playerCount>=2&&p.playerCount<=12&&!!d&&['prepare','drawing','guessing','result','finished'].includes(d.phase)&&Number.isSafeInteger(d.deadline)&&d.deadline>=0&&Number.isInteger(d.artist)&&d.artist>=0&&d.artist<p.playerCount&&d.artist===p.turn&&typeof d.answer==='string'&&d.answer.length>0&&Array.isArray(d.scores)&&d.scores.length===p.playerCount&&d.scores.every(Number.isInteger)&&Array.isArray(d.operations)&&d.operations.length<=4096&&Array.isArray(d.guesses)&&d.guesses.length<=200&&d.guesses.every(g=>typeof g.text==='string'&&g.text.length<=80&&g.actor>=0&&g.actor<p.playerCount)&&Array.isArray(d.remaining)&&new Set(d.remaining).size===d.remaining.length&&d.remaining.every(i=>Number.isInteger(i)&&i>=0&&i<p.playerCount)&&Array.isArray(d.stopVotes)&&new Set(d.stopVotes).size===d.stopVotes.length&&d.stopVotes.every(i=>i>=0&&i<p.playerCount)&&Array.isArray(d.protests)&&new Set(d.protests).size===d.protests.length&&d.protests.every(i=>i>=0&&i<p.playerCount&&eligible(state(p),i))&&!!d.settings&&Number.isInteger(d.roundId)&&d.roundId>=1&&d.settings.stopQuorum>=1&&d.settings.stopQuorum<=p.playerCount&&d.winner>=-1&&d.winner<p.playerCount;},
 actions(position,actor){const p=state(position),d=p.data;if(p.status!=='playing')return [];const out=[];
 if(!d.stopVotes.includes(actor))out.push({command:command(p,actor,'stop'),visibility:/** @type {'public'} */('public')});
 if(d.phase==='guessing'&&actor===d.settings.hostPlayer)out.push({command:command(p,actor,'give-up'),visibility:/** @type {'public'} */('public')});
 if((d.phase==='drawing'||d.phase==='guessing')&&actor===d.artist&&d.settings.answerMode==='oral')for(const player of players(p.playerCount).filter(i=>i!==d.artist))out.push({command:{...command(p,actor,'award'),player},visibility:/** @type {'public'} */('public')});
 if((d.phase==='drawing'||d.phase==='guessing')&&actor===d.artist&&d.settings.answerMode!=='oral')for(const g of d.guesses)out.push({command:{...command(p,actor,'confirm'),guessId:g.id},visibility:/** @type {'private'} */('private')});
 if(d.phase==='result'&&d.manual&&d.winner>=0&&!d.protested&&eligible(p,actor)&&!d.protests.includes(actor))out.push({command:command(p,actor,'protest'),visibility:/** @type {'public'} */('public')});return out;},
 inputs(position,actor){const p=state(position),d=p.data;if(p.status!=='playing')return [];
 if(d.phase==='drawing'&&actor===d.artist&&d.operations.length<4096)return [{command:command(p,actor,'draw'),visibility:'public',fields:{operation:{kind:'ink'}}}];
 if((d.phase==='drawing'||d.phase==='guessing')&&actor!==d.artist&&d.settings.answerMode!=='oral'&&d.guesses.length<200)return [{command:command(p,actor,'guess'),visibility:'private',fields:{text:{kind:'text',maxLength:80}}}];return [];},
 reduce(position,actor,c,context){const p=state(JSON.parse(JSON.stringify(position))),d=p.data,now=context.now;
 if(c.roundId!==d.roundId)throw Error('KALY_STALE');
 if(c.type==='stop'){if(d.stopVotes.includes(actor))throw Error('KALY_DUPLICATE');if(d.stopVotes.length===0)d.voteDeadline=now+30000;d.stopVotes.push(actor);d.stopRequested=d.stopVotes.length>=d.settings.stopQuorum;}
 else if(c.type==='give-up'){if(d.phase!=='guessing'||actor!==d.settings.hostPlayer)throw Error('KALY_HOST');endRound(p,-1,'',false,now);}
 else if(c.type==='draw'){if(d.phase!=='drawing'||actor!==d.artist)throw Error('KALY_DRAW');const operation=c.operation;if(!operation||typeof operation!=='object'||Array.isArray(operation))throw Error('KALY_INK');if(operation.kind==='stroke'&&d.settings.strokeBudget>0&&d.operations.filter(o=>o&&typeof o==='object'&&!Array.isArray(o)&&o.kind==='stroke').length>=d.settings.strokeBudget)throw Error('KALY_STROKE_BUDGET');if(d.settings.noErase&&operation.kind==='clear')throw Error('KALY_NO_ERASE');if(d.operations.some(v=>v&&typeof v==='object'&&!Array.isArray(v)&&v.id===operation.id))throw Error('KALY_DUPLICATE_INK');d.operations.push(operation);}
 else if(c.type==='guess'){if(!['drawing','guessing'].includes(d.phase)||actor===d.artist||typeof c.text!=='string'||!normal(c.text))throw Error('KALY_GUESS');const guess={id:'g'+d.roundId+'-'+d.guesses.length,text:c.text.trim(),actor};d.guesses.push(guess);if(normal(c.text)===normal(d.answer))endRound(p,actor,guess.text,false,now);}
 else if(c.type==='award'){if(!['drawing','guessing'].includes(d.phase)||actor!==d.artist||d.settings.answerMode!=='oral'||!Number.isInteger(c.player)||Number(c.player)<0||Number(c.player)>=p.playerCount||c.player===d.artist)throw Error('KALY_AWARD');endRound(p,Number(c.player),'Устный ответ',true,now);}
 else if(c.type==='confirm'){if(!['drawing','guessing'].includes(d.phase)||actor!==d.artist)throw Error('KALY_CONFIRM');const g=d.guesses.find(g=>g.id===c.guessId);if(!g)throw Error('KALY_GUESS_ID');endRound(p,g.actor,g.text,true,now);}
 else if(c.type==='protest'){if(d.phase!=='result'||!d.manual||d.protested||!eligible(p,actor)||d.protests.includes(actor))throw Error('KALY_PROTEST');d.protests.push(actor);if(d.protests.length>=quorum(p.playerCount-2)){d.scores[d.winner]-=d.award;d.scores[d.artist]--;d.protested=true;}}
 else throw Error('KALY_COMMAND');
 return {position:p,events:[{type:'kaly.changed',actor:null,params:{phase:d.phase,roundId:d.roundId},visibility:{kind:'public'}}],turnEnded:position.data.phase!=='result'&&d.phase==='result',roundEnded:position.data.phase!=='result'&&d.phase==='result'};},
 advance(position,now){const p=state(JSON.parse(JSON.stringify(position))),d=p.data;if(p.status==='finished')return null;const voteExpired=d.voteDeadline>0&&!d.stopRequested&&now>=d.voteDeadline;if(voteExpired){d.stopVotes=[];d.voteDeadline=0;}if(now<d.deadline&&!voteExpired)return null;let transitions=0;
 while(p.status==='playing'&&now>=d.deadline){const at=d.deadline;if(++transitions>10000)throw Error('KALY_CLOCK_LIMIT');if(d.phase==='prepare'){d.phase='drawing';d.deadline=at+d.settings.durationSeconds*1000;}else if(d.phase==='drawing'){d.phase='guessing';d.deadline=at+15000;}else if(d.phase==='guessing')endRound(p,-1,'',false,at);else nextRound(p,at);}
 return {position:p,events:[{type:'kaly.clock',actor:null,params:{phase:d.phase,roundId:d.roundId},visibility:{kind:'public'}}],turnEnded:position.data.phase!=='result'&&d.phase==='result',roundEnded:position.data.phase!=='result'&&d.phase==='result'};},
 project(position,viewer){const p=state(position),d=p.data;return {phase:d.phase,deadline:d.deadline,roundId:d.roundId,cycle:d.cycle,artist:d.artist,answer:viewer===d.artist||d.phase==='result'||p.status==='finished'?d.answer:'',operations:d.operations,strokeRemaining:d.settings.strokeBudget===0?null:Math.max(0,d.settings.strokeBudget-d.operations.filter(o=>o&&typeof o==='object'&&!Array.isArray(o)&&o.kind==='stroke').length),guesses:d.guesses.map(g=>{const entry=/** @type {{[key:string]:JSONValue}} */({id:g.id,text:g.text});if(d.settings.answerMode==='named')entry.player=g.actor;return entry;}),scores:d.scores,winner:d.phase==='result'||p.status==='finished'?d.winner:-1,accepted:d.accepted,manual:d.manual,protests:d.protests,protested:d.protested,protestRequired:quorum(p.playerCount-2),stopVotes:d.stopVotes,voteDeadline:d.voteDeadline,stopRequested:d.stopRequested,settings:d.settings,remaining:d.remaining};},
 result(position){const d=state(position).data;return {winners:position.winners,places:d.scores.map(score=>1+d.scores.filter(v=>v>score).length),metrics:d.scores.map((value,player)=>({player,value,id:'points'}))};}
};
globalThis.PlayroomPackDefinition=definition;
