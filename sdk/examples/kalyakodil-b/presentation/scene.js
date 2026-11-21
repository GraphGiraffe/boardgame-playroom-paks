// @ts-check
/** @type {import('../sdk/contracts').Presentation} */
const presentation={
 metadata:{name:{key:'kaly.name'},rules:[
  SDK.text("presentation.690f637f6e0c"),
  SDK.text("presentation.56a19075683e"),
  SDK.text("presentation.7e104a8b16a1"),
  SDK.text("presentation.a0ffbef23ccb"),
  SDK.text("presentation.ae08aed8521e"),
  SDK.text("presentation.5d9b96e330e4"),
  SDK.text("presentation.0107c708db5c")
 ]},
 action(command,projection){if(command.type==='vote-stop')return Number(SDK.read(projection.data,'stopDeadline'))>0?SDK.text("presentation.0a3173e3188c"):SDK.text("presentation.32ed9f9f917d");if(command.type==='give-up')return SDK.text("presentation.4b93113fe22b");if(command.type==='protest')return SDK.text("presentation.49e7de9531cb");if(command.type==='award')return {key:'kaly.award',params:{player:{kind:'player-reference',index:Number(command.player)}}};if(command.type==='accept')return SDK.text("presentation.f656fe8173a2")+command.guessId;return String(command.type);},
 event:event=>({message:typeof event==='object'&&event!==null&&!Array.isArray(event)&&event.type==='kaly.phase'?SDK.text("kaly.phase"):SDK.text("kaly.updated")}),
 scene(projection){const d=projection.data,scores=/** @type {number[]} */(SDK.read(d,'scores')),guesses=/** @type {{id:string,text:string,player?:number}[]} */(SDK.read(d,'guesses')),phase=String(SDK.read(d,'phase')),draw=(projection.inputs||[]).find(input=>input.command.type==='draw'),guess=(projection.inputs||[]).find(input=>input.command.type==='guess'),labels={prepare:SDK.text("presentation.5ea5c68f20d4"),drawing:SDK.text("presentation.47a0badade12"),guessing:SDK.text("presentation.0d623898229c"),result:SDK.text("presentation.4997a5143d9f"),finished:SDK.text("presentation.f0a4a16c9d4c")};
 return {contractVersion:1,id:'kalyakodil-b',family:'drawing',menuActions:projection.actions.filter(c=>c.type==='vote-stop').map(command=>({command,kind:'vote',label:SDK.text("presentation.32ed9f9f917d")})),
  prompt:String(SDK.read(d,'answer')),
  ...(Number(SDK.read(d,'stopDeadline'))>0?{vote:{against:/** @type {number[]} */(SDK.read(d,'stopAgainst')||[]),...(projection.actions.find(c=>c.type==='vote-no')?{againstCommand:projection.actions.find(c=>c.type==='vote-no')}:{}) ,id:'stop-'+String(SDK.read(d,'voteSequence')),title:SDK.text("presentation.ddf3a1da762f"),deadline:Number(SDK.read(d,'stopDeadline')),startedAt:Math.max(0,Number(SDK.read(d,'stopDeadline'))-30000),eligible:Array.from({length:projection.playerCount},(_,n)=>n),voted:/** @type {number[]} */(SDK.read(d,'votes')),required:Number(SDK.read(d,'stopQuorum')),accepted:Boolean(SDK.read(d,'stopRequested')),...(projection.actions.some(c=>c.type==='vote-stop')?{command:projection.actions.find(c=>c.type==='vote-stop')}:{})}}:{}),
  clock:{phase,deadline:Number(SDK.read(d,'deadline')),startedAt:Number(SDK.read(d,'phaseStartedAt')),player:Number(SDK.read(d,'artist')),label:labels[/** @type {keyof typeof labels} */(phase)]||phase},
  players:Array.from({length:projection.playerCount},(_,player)=>({player,metrics:[{id:'points',kind:'points',label:{key:'kaly.score'},value:scores[player],resultUsage:true}]})),
  canvas:{id:'drawing-'+String(SDK.read(d,'round')),operations:/** @type {import('../sdk/contracts').JSONValue[]} */(SDK.read(d,'ink')),enabled:!!draw,...(draw?{command:draw.command}:{})},
  chat:{messages:guesses.map(g=>({id:g.id,text:g.text,...(g.player===undefined?{}:{player:g.player}),...(projection.actions.some(c=>c.type==='accept'&&c.guessId===g.id)?{confirmCommand:projection.actions.find(c=>c.type==='accept'&&c.guessId===g.id)}:{})})),...(guess?{command:guess.command}:{}),placeholder:SDK.read(d,'singleGuess')?SDK.text("presentation.4543dd10dafb"):SDK.text("presentation.2554b0973f84")},
  roundResult:['result','finished'].includes(phase)?{answer:String(SDK.read(d,'answer')),accepted:String(SDK.read(d,'accepted')),winner:Number(SDK.read(d,'winner')),artist:Number(SDK.read(d,'artist')),protests:SDK.read(d,'protests'),required:Number(SDK.read(d,'protestRequired')),overturned:SDK.read(d,'overturned')}:null
 };}
};
globalThis.PlayroomPackPresentation=presentation;
