// @ts-check
/** @typedef {import('../sdk/contracts').Position} Position */
/** @typedef {import('../sdk/contracts').Command} Command */
/** @typedef {import('../sdk/contracts').JSONValue} JSONValue */
/** @typedef {{id:string,actor:number,text:string}} Guess */
/** @typedef {{phase:string,now:number,deadline:number,round:number,cycle:number,artist:number,host:number,answer:string,difficulty:string,answerMode:string,mode:string,rounds:number,cycles:number,duration:number,stopQuorum:number,seed:number,scores:number[],seen:number[],votes:number[],stopAgainst:number[],stopDeadline:number,voteSequence:number,stopRequested:boolean,guesses:Guess[],ink:JSONValue[],winner:number,accepted:string,manual:boolean,reward:number,protests:number[],protestRequired:number,overturned:boolean,strokeLimit:number,singleGuess:boolean,exactBonus:boolean}} Data */
/** @param {Position} p @returns {Data} */
function data(p){return /** @type {Data} */ (/** @type {unknown} */ (p.data));}
/** @param {unknown} n @param {number} min @param {number} max @param {number} fallback */
function integer(n,min,max,fallback){return typeof n==='number'&&Number.isInteger(n)&&n>=min&&n<=max?n:fallback;}
/** @param {number} n */
function quorum(n){return SDK.voteThreshold(n);}
/** @param {string} text */
function normalized(text){return text.toLowerCase().replace(/ё/g,'е').trim().replace(/\s+/g,' ');}
const banks={easy:['кот','дом','зонт','рыба','луна','сыр','мяч','ключ','слон','чашка','цветок','сапог'],medium:['парусник','велосипед','водопад','светофор','карусель','подсолнух','вертолёт','библиотека','снеговик','муравейник','аквариум','скворечник'],hard:['невесомость','вдохновение','равновесие','ностальгия','сопротивление','притяжение','перспектива','бесконечность','сотрудничество','изобретение','предчувствие','разочарование']};
/** @param {Data} d @param {number} count */
function random(d,count){d.seed=(Math.imul(d.seed,1664525)+1013904223)>>>0;return d.seed%count;}
/** @param {Data} d */
function word(d){const bank=banks[/** @type {keyof typeof banks} */(d.difficulty)];d.answer=bank[random(d,bank.length)];}
/** @param {Position} p @param {string} event @returns {import('../sdk/contracts').Transition} */
function transition(p,event){return {position:p,events:[{type:event,actor:null,params:{round:data(p).round},visibility:{kind:'public'}}]};}
/** @param {Position} p @param {number} winner @param {string} accepted @param {boolean} manual */
function finishRound(p,winner,accepted,manual){const d=data(p);d.phase='result';d.deadline=d.now+12000;d.winner=winner;d.accepted=accepted;d.manual=manual;d.protestRequired=quorum(p.playerCount-2);d.reward=winner<0?0:1+(!manual&&d.exactBonus?1:0);if(winner>=0)d.scores[winner]+=d.reward;}
/** @param {Position} p */
function nextRound(p){const d=data(p),remaining=Array.from({length:p.playerCount},(_,n)=>n).filter(n=>!d.seen.includes(n)),complete=d.mode==='cycles'&&remaining.length===0;
 if((d.mode==='rounds'&&(d.stopRequested||(d.rounds>0&&d.round>=d.rounds)))||(d.mode==='cycles'&&complete&&(d.stopRequested||d.cycle>=d.cycles))){p.status='finished';d.phase='finished';d.deadline=d.now;p.winners=d.scores.map((score,n)=>score===Math.max(...d.scores)?n:-1).filter(n=>n>=0);return;}
 let candidates=d.mode==='cycles'?remaining:Array.from({length:p.playerCount},(_,n)=>n).filter(n=>n!==d.artist);
 if(complete){d.cycle++;d.seen=[];candidates=Array.from({length:p.playerCount},(_,n)=>n);}
 let artist=d.winner>=0&&!d.overturned?d.winner:-1;
 if(artist<0||(d.mode==='cycles'&&!candidates.includes(artist)))artist=candidates[random(d,candidates.length)];
 d.artist=artist;p.turn=artist;d.seen.push(artist);d.round++;d.phase='prepare';d.deadline=d.now+3000;d.guesses=[];d.ink=[];d.winner=-1;d.accepted='';d.manual=false;d.reward=0;d.protests=[];d.overturned=false;word(d);
}
/** @param {Position} p @param {number} actor */
function actions(p,actor){const d=data(p);
/** @type {import('../sdk/contracts').Choice[]} */const choices=[];if(p.status!=='playing')return choices;
 const command=(/** @type {string} */type)=>({type,roundId:d.round});
 if(!d.stopRequested&&!d.votes.includes(actor))choices.push({command:command('vote-stop'),visibility:'public'});if(!d.stopRequested&&d.stopDeadline>0&&!(d.stopAgainst||[]).includes(actor))choices.push({command:command('vote-no'),visibility:'public'});
 if(d.phase==='guessing'&&actor>=0&&actor===d.host)choices.push({command:command('give-up'),visibility:'private'});
 if(['drawing','guessing'].includes(d.phase)&&actor===d.artist&&d.answerMode==='oral')for(let player=0;player<p.playerCount;player++)if(player!==actor)choices.push({command:{...command('award'),player},visibility:'private'});
 if(['drawing','guessing'].includes(d.phase)&&actor===d.artist)for(const guess of d.guesses)choices.push({command:{...command('accept'),guessId:guess.id},visibility:'private'});
 if(d.phase==='result'&&d.manual&&!d.overturned&&actor!==d.artist&&actor!==d.winner&&!d.protests.includes(actor))choices.push({command:command('protest'),visibility:'public'});
 return choices;
}
/** @param {Position} p @param {number} actor */
function inputs(p,actor){const d=data(p);
/** @type {import('../sdk/contracts').InputChoice[]} */const choices=[];if(p.status!=='playing')return choices;
 if(d.phase==='drawing'&&actor===d.artist&&d.ink.length<1000&&(!d.strokeLimit||d.ink.length<d.strokeLimit))choices.push({command:{type:'draw',roundId:d.round},visibility:'private',fields:{operation:{kind:'ink'}}});
 if(d.answerMode!=='oral'&&['drawing','guessing'].includes(d.phase)&&actor!==d.artist&&(!d.singleGuess||!d.guesses.some(g=>g.actor===actor))&&d.guesses.length<80)choices.push({command:{type:'guess',roundId:d.round},visibility:'private',fields:{text:{kind:'text',maxLength:80}}});
 return choices;
}
/** @type {import('../sdk/contracts').Definition} */
const definition={contractVersion:1,id:'kalyakodil-b',rounds:true,minPlayers:2,maxPlayers:12,
 create(options){const count=integer(options.playerCount,2,12,2),artist=integer(options.firstPlayer,0,count-1,0),now=integer(options.now,0,Number.MAX_SAFE_INTEGER,0);
  const settings=/** @type {{[key:string]:JSONValue}} */(options.options||{});
/** @type {Data} */const d={phase:'prepare',now,deadline:now+3000,round:1,cycle:1,artist,host:integer(settings.hostPlayer??options.hostPlayer,-1,count-1,0),answer:'',answerMode:['anonymous','named','oral'].includes(String(settings.answerMode))?String(settings.answerMode):'anonymous',difficulty:['easy','medium','hard'].includes(String(settings.difficulty))?String(settings.difficulty):'easy',mode:settings.roundMode==='cycles'?'cycles':'rounds',rounds:[0,10,20,30].includes(Number(settings.rounds))?Number(settings.rounds):10,cycles:integer(Number(settings.cycles),2,5,2),duration:integer(Number(settings.durationSeconds),30,180,60),stopQuorum:integer(options.stopQuorum,1,count,quorum(count)),seed:integer(options.rng,0,4294967295,1),scores:Array(count).fill(0),seen:[artist],votes:[],stopAgainst:[],stopDeadline:0,voteSequence:0,stopRequested:false,guesses:[],ink:[],winner:-1,accepted:'',manual:false,reward:0,protests:[],protestRequired:quorum(count-2),overturned:false,strokeLimit:[12,24,48].includes(Number(settings.strokeLimit))?Number(settings.strokeLimit):0,singleGuess:settings.singleGuess===true||settings.singleGuess==='true',exactBonus:settings.exactBonus===true||settings.exactBonus==='true'};word(d);return {playerCount:count,turn:artist,status:'playing',winners:[],data:d};},
 validate(p){const d=data(p);return (!d.stopAgainst||Array.isArray(d.stopAgainst)&&new Set(d.stopAgainst).size===d.stopAgainst.length&&d.stopAgainst.every(i=>Number.isInteger(i)&&i>=0&&i<p.playerCount&&!d.votes.includes(i)))&&p.playerCount>=2&&p.playerCount<=12&&Number.isInteger(p.playerCount)&&p.turn===d.artist&&Number.isInteger(d.artist)&&d.artist>=0&&d.artist<p.playerCount&&['prepare','drawing','guessing','result','finished'].includes(d.phase)&&Number.isSafeInteger(d.now)&&Number.isSafeInteger(d.deadline)&&d.deadline>=0&&d.round>=1&&d.scores.length===p.playerCount&&d.scores.every(Number.isInteger)&&Array.isArray(d.ink)&&d.ink.length<=1000&&Array.isArray(d.guesses)&&d.guesses.length<=80&&d.guesses.every(g=>Number.isInteger(g.actor)&&g.actor>=0&&g.actor<p.playerCount&&typeof g.text==='string'&&g.text.length<=80)&&typeof d.answer==='string'&&d.answer.length>0&&['easy','medium','hard'].includes(d.difficulty);},
 actions,inputs,
 reduce(position,actor,command,context){const p=/** @type {Position} */(JSON.parse(JSON.stringify(position))),d=data(p);if(command.roundId!==d.round)throw Error('Stale round');if(!Number.isSafeInteger(context.now)||context.now<d.now)throw Error('Invalid command clock');d.now=context.now;if(command.type==='draw'&&context.now>=d.deadline)throw Error('Drawing deadline expired');
 if(command.type==='vote-no'){if(d.stopRequested||!d.stopDeadline||(d.stopAgainst||[]).includes(actor))throw Error('KALY_VOTE');d.votes=d.votes.filter(v=>v!==actor);d.stopAgainst=[...(d.stopAgainst||[]),actor];}
 else if(command.type==='vote-stop'){if(d.stopDeadline===0){d.stopDeadline=d.now+30000;d.voteSequence++;d.stopAgainst=[];}d.stopAgainst=(d.stopAgainst||[]).filter(v=>v!==actor);if(!d.votes.includes(actor))d.votes.push(actor);if(d.votes.length>=d.stopQuorum)d.stopRequested=true;}
 else if(command.type==='give-up')finishRound(p,-1,'',false);
 else if(command.type==='draw'){if(d.ink.length>=1000)throw Error('Canvas operation limit');d.ink.push(command.operation);}
 else if(command.type==='guess'){const text=String(command.text).trim();if(!text)throw Error('Empty guess');const guess={id:'g'+(d.guesses.length+1),actor,text};d.guesses.push(guess);if(normalized(text)===normalized(d.answer))finishRound(p,actor,text,false);}
 else if(command.type==='award')finishRound(p,Number(command.player),'Устный ответ',true);
 else if(command.type==='accept'){const guess=d.guesses.find(g=>g.id===command.guessId);if(!guess)throw Error('Unknown guess');finishRound(p,guess.actor,guess.text,true);}
 else if(command.type==='protest'){if(!d.protests.includes(actor))d.protests.push(actor);if(d.protests.length>=d.protestRequired&&!d.overturned){d.scores[d.winner]-=d.reward;d.scores[d.artist]-=1;d.overturned=true;}}
 else throw Error('Unknown command');return transition(p,'kaly.changed');},
 clockActions(position){const d=data(position);return d.phase==='guessing'?[{type:'end-guessing',roundId:d.round}]:[];},
 advance(position,now,control){if(!Number.isSafeInteger(now)||now<data(position).now)throw Error('Clock must be monotonic');const expiredVotes=!data(position).stopRequested&&data(position).stopDeadline>0&&now>=data(position).stopDeadline;if(position.status==='finished'||now<data(position).deadline&&!expiredVotes&&!control)return null;const p=/** @type {Position} */(JSON.parse(JSON.stringify(position))),d=data(p);d.now=now;if(control)d.deadline=Math.min(d.deadline,now);if(expiredVotes){d.votes=[];d.stopAgainst=[];d.stopDeadline=0;}if(now<d.deadline)return transition(p,'kaly.vote-expired');const boundary=d.deadline,endedTurn=d.phase==='result',endedRound=endedTurn&&(d.mode==='rounds'||d.seen.length===p.playerCount);if(d.phase==='prepare'){d.phase='drawing';d.deadline=boundary+d.duration*1000;}else if(d.phase==='drawing'){d.phase='guessing';d.deadline=boundary+15000;}else if(d.phase==='guessing'){finishRound(p,-1,'',false);d.deadline=boundary+12000;}else if(d.phase==='result'){nextRound(p);if(p.status==='playing')d.deadline=boundary+3000;}return {...transition(p,'kaly.phase'),turnEnded:endedTurn,roundEnded:endedRound};},
 project(position,viewer){const d=data(position),show=viewer===d.artist||['result','finished'].includes(d.phase);
/** @type {JSONValue[]} */const guesses=[];for(const g of d.guesses){const entry=/** @type {{[key:string]:JSONValue}} */({id:g.id,text:g.text});if(d.answerMode==='named')entry.player=g.actor;guesses.push(entry);}return {answerMode:d.answerMode,phase:d.phase,deadline:d.deadline,phaseStartedAt:Math.max(0,d.deadline-(d.phase==='prepare'?3000:d.phase==='drawing'?d.duration*1000:d.phase==='guessing'?15000:12000)),round:d.round,cycle:d.cycle,artist:d.artist,answer:show?d.answer:'',scores:d.scores,ink:d.ink,guesses,winner:d.winner,accepted:d.accepted,manual:d.manual,protests:d.protests,protestRequired:d.protestRequired,overturned:d.overturned,votes:d.votes,stopAgainst:d.stopAgainst||[],stopDeadline:d.stopDeadline,voteSequence:d.voteSequence,stopQuorum:d.stopQuorum,stopRequested:d.stopRequested,strokeLimit:d.strokeLimit,singleGuess:d.singleGuess,exactBonus:d.exactBonus};},
 score:position=>data(position).scores,
 result(position){const d=data(position);return {winners:position.winners,places:d.scores.map(score=>1+d.scores.filter(other=>other>score).length),metrics:[{id:'score',values:d.scores}]};}
};
globalThis.PlayroomPackDefinition=definition;
