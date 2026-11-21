// @ts-check
/** @typedef {{id:number,text:string,player:number,penalty:number}&{[key:string]:J}} Guess */
/** @typedef {{phase:string,now:number,deadline:number,drawingStart:number,roundId:number,cycle:number,artist:number,hostPlayer:number,answerMode:string,word:string,bank:string,mode:string,durationSeconds:number,rounds:number,cycles:number,scores:number[],completed:number[],stopVotes:number[],stopAgainst:number[],stopPending:boolean,voteDeadline:number,protests:number[],protested:boolean,manualAward:boolean,winner:number,accepted:string,artistReward:number,winnerReward:number,guesses:Guess[],operations:J[],lengthHint:boolean,wrongGuessPenalty:boolean,fastArtistBonus:boolean}&{[key:string]:J}} Data */
/** @typedef {import('../sdk/contracts').Position & {data:Data}} P */
/** @typedef {import('../sdk/contracts').Position} Position */
/** @typedef {import('../sdk/contracts').Command} Command */
/** @typedef {import('../sdk/contracts').JSONValue} J */
const banks={
 easy:['кот','дом','мяч','зонт','сыр','луна','гриб','рыба','слон','чашка','ключ','торт','ёлка','шар','сова','солнце'],
 medium:['корабль','чайник','фонарь','самокат','палатка','водопад','кактус','робот','медуза','ракета','мельница','чемодан','барабан','подснежник','верблюд','гамак'],
 hard:['невесомость','воображение','равновесие','путешествие','притяжение','вдохновение','головоломка','любопытство','наблюдение','изобретение','отражение','соперничество','празднование','недоразумение','взаимопомощь','предчувствие']
};
/** @param {Position} p @returns {Data} */
const data=p=>/** @type {Data} */(p.data);
/** @param {Position} p @returns {P} */
const copy=p=>JSON.parse(JSON.stringify(p));
/** @param {number} voters */
const quorum=voters=>SDK.voteThreshold(voters);
/** @param {string} word */
const normal=word=>word.trim().toLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ');
/** @param {P} p @param {number} size */
function random(p,size){p.rng=((p.rng||1)*1664525+1013904223)>>>0;return p.rng%size;}
/** @param {P} p */
function word(p){const b=banks[/** @type {keyof typeof banks} */(p.data.bank)];p.data.word=b[random(p,b.length)];}
/** @param {P} p @param {number} at */
function startRound(p,at){const d=p.data;d.phase='prepare';d.now=at;d.deadline=at+3000;d.drawingStart=at+3000;d.guesses=[];d.operations=[];d.winner=-1;d.manualAward=false;d.accepted='';d.artistReward=0;d.winnerReward=0;d.protests=[];d.protested=false;p.turn=d.artist;word(p);}
/** @param {P} p @param {number} winner @param {string} accepted @param {number} at @param {number} [refund] @param {boolean} [manualAward] */
function resolve(p,winner,accepted,at,refund=0,manualAward=false){const d=p.data;d.winner=winner;d.manualAward=manualAward;d.accepted=accepted;d.artistReward=winner>=0&&d.fastArtistBonus&&d.phase==='drawing'&&at<d.drawingStart+d.durationSeconds*500?1:0;d.winnerReward=winner>=0?1+refund:0;if(winner>=0){d.scores[winner]+=d.winnerReward;d.scores[d.artist]+=d.artistReward;}d.phase='result';d.deadline=at+12000;}
/** @param {P} p */
function finish(p){p.status='finished';const best=Math.max(...p.data.scores);p.winners=p.data.scores.flatMap((score,i)=>score===best?[i]:[]);}
/** @param {P} p @param {number} at */
function nextRound(p,at){const d=p.data;d.completed.push(d.artist);let candidates=Array.from({length:p.playerCount},(_,i)=>i).filter(i=>!d.completed.includes(i));
 if(d.mode==='cycles'){
  if(!candidates.length){if(d.stopPending||d.cycle>=d.cycles){finish(p);return;}d.cycle++;d.completed=[];candidates=Array.from({length:p.playerCount},(_,i)=>i);}
  d.artist=d.protested?candidates[random(p,candidates.length)]:Array.from({length:p.playerCount},(_,i)=>(d.artist+i+1)%p.playerCount).find(i=>candidates.includes(i))??candidates[0];
 }else{
  if(d.stopPending||d.rounds>0&&d.roundId>=d.rounds){finish(p);return;}
  if(d.winner>=0&&!d.protested)d.artist=d.winner;
  else{const pool=Array.from({length:p.playerCount},(_,i)=>i).filter(i=>i!==d.artist);d.artist=pool[random(p,pool.length)];}
  d.completed=[];
 }
 d.roundId++;startRound(p,at);
}
/** @param {{playerCount:number;firstPlayer:number;rng:number;[key:string]:J}} o @returns {P} */
function create(o){const n=o.playerCount,first=o.firstPlayer;if(!Number.isInteger(n)||n<2||n>12||!Number.isInteger(first)||first<0||first>=n)throw Error('KALY_OPTIONS');
 const settings=/** @type {{[key:string]:J}} */(o.options||{});
 const duration=Number(settings.durationSeconds??60),rounds=Number(settings.rounds??10),cycles=Number(settings.cycles??2),host=Number(settings.hostPlayer??o.hostPlayer??0),now=Number(o.now??0),bank=String(settings.bank??'easy'),mode=String(settings.roundMode??'rounds'),answerMode=String(settings.answerMode??'anonymous');
 if(!Number.isInteger(duration)||duration<30||duration>180||![0,10,20,30].includes(rounds)||!Number.isInteger(cycles)||cycles<2||cycles>5||!Number.isInteger(host)||host< -1||host>=n||!Number.isSafeInteger(now)||now<0||!Object.hasOwn(banks,bank)||!['rounds','cycles'].includes(mode)||!['anonymous','named','oral'].includes(answerMode))throw Error('KALY_OPTIONS');
 // Installed room settings carry control values as strings; Studio uses typed values.
 for(const key of ['lengthHint','wrongGuessPenalty','fastArtistBonus']){
  const value=settings[key];
  if(value!==undefined&&value!==true&&value!==false&&value!=='true'&&value!=='false')throw Error('KALY_OPTIONS');
 }
 const p=/** @type {P} */({playerCount:n,turn:first,status:'playing',winners:[],rng:Number(o.rng)>>>0,data:{phase:'prepare',now,deadline:now+3000,drawingStart:now+3000,roundId:1,cycle:1,artist:first,hostPlayer:host,answerMode,word:'',bank,mode,durationSeconds:duration,rounds,cycles,scores:Array(n).fill(0),completed:[],stopVotes:[],stopAgainst:[],stopPending:false,voteDeadline:0,protests:[],protested:false,manualAward:false,winner:-1,accepted:'',artistReward:0,winnerReward:0,guesses:[],operations:[],lengthHint:settings.lengthHint===true||settings.lengthHint==='true',wrongGuessPenalty:settings.wrongGuessPenalty===true||settings.wrongGuessPenalty==='true',fastArtistBonus:settings.fastArtistBonus===true||settings.fastArtistBonus==='true'}});word(p);return p;
}
/** @param {Position} p */
function validate(p){const d=data(p),n=p.playerCount,player=/** @param {unknown} i */i=>Number.isInteger(i)&&Number(i)>=0&&Number(i)<n;
 return (!d.stopAgainst||Array.isArray(d.stopAgainst)&&new Set(d.stopAgainst).size===d.stopAgainst.length&&d.stopAgainst.every(i=>player(i)&&!d.stopVotes.includes(i)))&&Number.isInteger(n)&&n>=2&&n<=12&&player(d.artist)&&(d.hostPlayer===-1||player(d.hostPlayer))&&p.turn===d.artist&&['prepare','drawing','guessing','result'].includes(d.phase)&&Number.isSafeInteger(d.voteDeadline)&&d.voteDeadline>=0&&Number.isSafeInteger(d.now)&&d.now>=0&&Number.isSafeInteger(d.deadline)&&d.deadline>=0&&Number.isSafeInteger(d.drawingStart)&&d.drawingStart>=0&&Number.isInteger(d.roundId)&&d.roundId>0&&Number.isInteger(d.cycle)&&d.cycle>=1&&d.cycle<=d.cycles&&typeof d.word==='string'&&d.word.length>0&&Object.hasOwn(banks,d.bank)&&['rounds','cycles'].includes(d.mode)&&['anonymous','named','oral'].includes(d.answerMode)&&Number.isInteger(d.durationSeconds)&&d.durationSeconds>=30&&d.durationSeconds<=180&&[0,10,20,30].includes(d.rounds)&&Number.isInteger(d.cycles)&&d.cycles>=2&&d.cycles<=5&&Array.isArray(d.scores)&&d.scores.length===n&&d.scores.every(Number.isSafeInteger)&&[d.completed,d.stopVotes,d.protests].every(row=>Array.isArray(row)&&new Set(row).size===row.length&&row.every(player))&&[d.stopPending,d.protested,d.lengthHint,d.wrongGuessPenalty,d.fastArtistBonus].every(v=>typeof v==='boolean')&&(d.winner===-1||player(d.winner))&&typeof d.accepted==='string'&&[0,1].includes(d.artistReward)&&[0,1,2].includes(d.winnerReward)&&Array.isArray(d.guesses)&&d.guesses.length<=200&&d.guesses.every((g,i)=>g.id===i+1&&player(g.player)&&[0,1].includes(g.penalty)&&typeof g.text==='string'&&g.text.length<=80)&&Array.isArray(d.operations)&&d.operations.length<=2048&&Number.isInteger(p.rng)&&Number(p.rng)>=0&&Number(p.rng)<=4294967295;
}
/** @param {Position} p @param {number} actor @returns {import('../sdk/contracts').Choice[]} */
function actions(p,actor){const d=data(p);if(p.status!=='playing'||actor<0||actor>=p.playerCount)return [];
 /** @type {import('../sdk/contracts').Choice[]} */
 const out=[];
 if(!d.stopPending&&!d.stopVotes.includes(actor))out.push({command:{type:'stop',roundId:d.roundId},visibility:'public'});if(!d.stopPending&&d.voteDeadline>0&&!(d.stopAgainst||[]).includes(actor))out.push({command:{type:'vote-no',roundId:d.roundId},visibility:'public'});
 if(d.phase==='guessing'&&actor===d.hostPlayer)out.push({command:{type:'give-up',roundId:d.roundId},visibility:'private'});
 if(['drawing','guessing'].includes(d.phase)&&actor===d.artist&&d.answerMode!=='oral')for(const g of d.guesses)out.push({command:{type:'confirm',roundId:d.roundId,guessId:g.id},visibility:'private'});
 if(['drawing','guessing'].includes(d.phase)&&actor===d.artist&&d.answerMode==='oral')for(let player=0;player<p.playerCount;player++)if(player!==actor)out.push({command:{type:'award',roundId:d.roundId,player},visibility:'private'});
 if(d.phase==='result'&&d.manualAward&&d.winner>=0&&!d.protested&&actor!==d.artist&&actor!==d.winner&&!d.protests.includes(actor))out.push({command:{type:'protest',roundId:d.roundId},visibility:'public'});
 return out;
}
/** @param {Position} p @param {number} actor */
function inputs(p,actor){const d=data(p);if(p.status!=='playing'||actor<0||actor>=p.playerCount)return [];
 if(d.phase==='drawing'&&actor===d.artist&&d.operations.length<2048)return [{command:{type:'draw',roundId:d.roundId},visibility:/** @type {const} */('public'),fields:{operation:{kind:/** @type {const} */('ink')}}}];
 if(['drawing','guessing'].includes(d.phase)&&actor!==d.artist&&d.answerMode!=='oral'&&d.guesses.length<200)return [{command:{type:'guess',roundId:d.roundId},visibility:/** @type {const} */('private'),fields:{text:{kind:/** @type {const} */('text'),maxLength:80,label:'Ваш вариант'}}}];return [];
}
/** @param {Position} position @param {number} actor @param {Command} c @param {{now:number}} context */
function reduce(position,actor,c,context){const p=copy(position),d=p.data;d.now=context.now;if(c.roundId!==d.roundId||p.status!=='playing')throw Error('KALY_COMMAND');
 if(c.type==='vote-no'){if(d.stopPending||!d.voteDeadline||(d.stopAgainst||[]).includes(actor))throw Error('KALY_VOTE');d.stopVotes=d.stopVotes.filter(v=>v!==actor);d.stopAgainst=[...(d.stopAgainst||[]),actor];}
 else if(c.type==='stop'){if(d.voteDeadline===0){d.voteDeadline=context.now+30000;d.stopAgainst=[];}d.stopAgainst=(d.stopAgainst||[]).filter(v=>v!==actor);if(!d.stopVotes.includes(actor))d.stopVotes.push(actor);d.stopPending=d.stopVotes.length>=quorum(p.playerCount);}
 else if(c.type==='give-up'){if(actor!==d.hostPlayer||d.phase!=='guessing')throw Error('KALY_GIVE_UP');resolve(p,-1,'',d.now);}
 else if(c.type==='draw'){if(actor!==d.artist||d.phase!=='drawing'||context.now>=d.deadline)throw Error('KALY_DRAW');const op=/** @type {{[key:string]:J}} */(c.operation);if(op.kind==='clear')d.operations=[];else d.operations.push(op);}
 else if(c.type==='guess'){if(actor===d.artist||d.answerMode==='oral'||!['drawing','guessing'].includes(d.phase))throw Error('KALY_GUESS');const text=String(c.text).trim();if(!text)throw Error('KALY_EMPTY_GUESS');const exact=normal(text)===normal(d.word),penalty=!exact&&d.wrongGuessPenalty?1:0;d.guesses.push({id:d.guesses.length+1,text,player:actor,penalty});if(exact)resolve(p,actor,text,d.now);else if(d.wrongGuessPenalty)d.scores[actor]--;}
 else if(c.type==='award'){const winner=Number(c.player);if(actor!==d.artist||d.answerMode!=='oral'||!['drawing','guessing'].includes(d.phase)||!Number.isInteger(winner)||winner<0||winner>=p.playerCount||winner===d.artist)throw Error('KALY_AWARD');resolve(p,winner,'Устный ответ',d.now,0,true);}
 else if(c.type==='confirm'){const guess=d.guesses.find(g=>g.id===c.guessId);if(actor!==d.artist||d.answerMode==='oral'||!['drawing','guessing'].includes(d.phase)||!guess)throw Error('KALY_CONFIRM');resolve(p,guess.player,guess.text,d.now,guess.penalty,true);}
 else if(c.type==='protest'){if(d.phase!=='result'||!d.manualAward||d.winner<0||actor===d.artist||actor===d.winner||d.protested)throw Error('KALY_PROTEST');if(!d.protests.includes(actor))d.protests.push(actor);if(d.protests.length>=quorum(p.playerCount-2)){d.scores[d.winner]-=d.winnerReward;d.winnerReward=0;d.scores[d.artist]-=1+d.artistReward;d.artistReward=0;d.protested=true;}}
 else throw Error('KALY_COMMAND');
 return {position:p,events:[{type:'kalyakodil.'+c.type,actor:null,params:{roundId:d.roundId},visibility:{kind:/** @type {const} */('public')}}],turnEnded:false};
}
/** @param {Position} position @param {number} now @param {Command} [control] @returns {import('../sdk/contracts').Transition|null} */
function advance(position,now,control){const d0=data(position);if(position.status!=='playing'||!Number.isSafeInteger(now)||(!control&&now<d0.deadline&&!(d0.voteDeadline>0&&!d0.stopPending&&now>=d0.voteDeadline)))return null;const p=copy(position),d=p.data;let ended=false,roundEnded=false;if(control)d.deadline=Math.min(d.deadline,now);if(d.voteDeadline>0&&!d.stopPending&&now>=d.voteDeadline){d.stopVotes=[];d.stopAgainst=[];d.voteDeadline=0;}
 for(let i=0;i<5&&p.status==='playing'&&now>=d.deadline;i++){const at=d.deadline;if(d.phase==='prepare'){d.phase='drawing';d.deadline=at+d.durationSeconds*1000;}else if(d.phase==='drawing'){d.phase='guessing';d.deadline=at+15000;}else if(d.phase==='guessing'){resolve(p,-1,'',at);}else{const cycle=d.cycle;nextRound(p,at);ended=true;roundEnded=d.mode==='rounds'||d.cycle!==cycle||d.completed.length===p.playerCount;break;}}
 // The host repeats advance; retain one checkpoint per artist boundary.
 d.now=now;return {position:p,events:[],turnEnded:ended,roundEnded};
}
/** @param {Position} p */
function score(p){const d=data(p),revealed=d.phase==='result'||p.status==='finished';return d.scores.map((value,player)=>revealed?value:value+d.guesses.filter(g=>g.player===player).reduce((sum,g)=>sum+g.penalty,0));}
/** @param {Position} p @param {number} viewer @returns {{[key:string]:J}} */
function project(p,viewer){const d=data(p),revealed=d.phase==='result'||p.status==='finished';return {answerMode:d.answerMode,phase:d.phase,deadline:d.deadline,phaseStartedAt:Math.max(0,d.deadline-(d.phase==='prepare'?3000:d.phase==='drawing'?d.durationSeconds*1000:d.phase==='guessing'?15000:12000)),roundId:d.roundId,cycle:d.cycle,artist:d.artist,hostPlayer:d.hostPlayer,word:revealed||viewer===d.artist?d.word:'',wordLength:d.lengthHint?d.word.length:0,scores:score(p),completed:[...d.completed],stopVotes:[...d.stopVotes],stopAgainst:d.stopAgainst||[],stopPending:d.stopPending,voteDeadline:d.voteDeadline,stopRequired:quorum(p.playerCount),protests:[...d.protests],protestRequired:quorum(p.playerCount-2),protested:d.protested,winner:revealed?d.winner:-1,accepted:revealed?d.accepted:'',guesses:d.guesses.map(g=>/** @type {J} */(d.answerMode==='named'?{id:g.id,text:g.text,player:g.player}:{id:g.id,text:g.text})),operations:d.operations};}
/** @param {Position} p */
function result(p){const scores=data(p).scores;return {winners:p.winners,places:scores.map(score=>1+new Set(scores.filter(other=>other>score)).size),metrics:[{id:'points',values:scores}]};}
function clockActions(/** @type {Position} */ position){const d=data(position);return d.phase==='guessing'?[{type:'end-guessing',roundId:d.roundId}]:[];}
const definition={contractVersion:/** @type {const} */(1),id:'kalyakodil-c',rounds:true,minPlayers:2,maxPlayers:12,create,validate,actions,inputs,reduce,clockActions,advance,project,score,result};
globalThis.PlayroomPackDefinition=definition;
