// @ts-check
/** @typedef {import('../sdk/contracts').JSONValue} SceneValue */
/** @typedef {{[key:string]:SceneValue}} Row */
/** @type {import('../sdk/contracts').Presentation} */
const presentation={
 metadata:{name:SDK.text("name"),rules:[
 SDK.text("presentation.689bf0ac653e"),
 SDK.text("presentation.a2b2a4db7485"),
 SDK.text("presentation.2b3170e7bc44"),
 SDK.text("presentation.845bc96e55e6"),
 SDK.text("presentation.15ed77b8e06c"),
 SDK.text("presentation.8086eae97c7b")
 ]},
 action:(c,p)=>c.type==='award'?SDK.text("presentation.366b4e150c1c")+(Number(c.player)+1):c.type==='stop'?(Number(p.data.voteDeadline)>0?SDK.text("presentation.73d6a7acbc00"):SDK.text("presentation.32ed9f9f917d")):c.type==='protest'?SDK.text("presentation.7847ed17fb83"):c.type==='give-up'?SDK.text("presentation.5354a6748619"):c.type==='confirm'?SDK.text("presentation.bd57905dcf87")+c.guessId:c.type==='draw'?SDK.text("presentation.2cb442e7dd2b"):SDK.text("presentation.ce1882ab9de7"),
 event:()=>({message:SDK.text("presentation.633e75a1aab8")}),
 /** @returns {import('../sdk/contracts').Scene} */
 scene(p){const d=p.data,artist=Number(SDK.read(d,'artist')),roundId=Number(SDK.read(d,'roundId')),phase=String(SDK.read(d,'phase')),active=p.status==='playing',guesses=/** @type {Row[]} */(SDK.read(d,'guesses')),scores=/** @type {number[]} */(SDK.read(d,'scores'));
 const command=(/** @type {string} */type)=>p.actions.find(c=>c.type===type)||null;
 const input=(/** @type {string} */type)=>(p.inputs||[]).find(choice=>choice.command.type===type)?.command||null;
 const drawCommand=input('draw'),guessCommand=input('guess');
 return {contractVersion:1,id:'kalyakodil-c',family:'drawing',menuActions:p.actions.filter(c=>c.type==='stop').map(command=>({command,kind:'vote',label:SDK.text("presentation.32ed9f9f917d")})),geometry:{topology:'drawing'},zones:[{id:'field',kind:'table'},{id:'canvas',kind:'canvas'}],objects:[],interactions:[],
  players:Array.from({length:p.playerCount},(_,player)=>({player,metrics:[{id:'points',kind:'points',value:scores[player],label:SDK.text("points")}]})),
  prompt:d.word?String(d.word):Number(d.wordLength)>0?SDK.text("presentation.407779f87179")+d.wordLength:SDK.text("presentation.f1475d0eccee"),
  ...(Number(d.voteDeadline)>0||d.stopPending===true?{vote:{against:/** @type {number[]} */(d.stopAgainst||[]),...(p.actions.find(c=>c.type==='vote-no')?{againstCommand:p.actions.find(c=>c.type==='vote-no')}:{}) ,id:'stop-'+d.voteDeadline,title:SDK.text("presentation.1e73a7304ae9"),deadline:Number(d.voteDeadline),startedAt:Math.max(0,Number(d.voteDeadline)-30000),eligible:Array.from({length:p.playerCount},(_,i)=>i),voted:/** @type {number[]} */(d.stopVotes),required:Number(d.stopRequired),accepted:d.stopPending===true,...(command('stop')?{command:/** @type {import('../sdk/contracts').Command} */(command('stop'))}:{})}}:{}),
  canvas:{id:'drawing-'+roundId,operations:/** @type {SceneValue[]} */(SDK.read(d,'operations')),enabled:!!drawCommand,...(drawCommand?{command:drawCommand}:{})},
  clock:{phase,deadline:Number(SDK.read(d,'deadline')),startedAt:Number(d.phaseStartedAt),player:artist,label:phase==='prepare'?SDK.text("prepare"):phase==='drawing'?SDK.text("drawing"):phase==='guessing'?SDK.text("guessing"):SDK.text("presentation.330430138981")},
  chat:{messages:guesses.map(g=>({id:String(g.id),text:String(g.text),...(g.player===undefined?{}:{player:Number(g.player)}),...(p.actions.some(c=>c.type==='confirm'&&c.guessId===g.id)?{confirmCommand:p.actions.find(c=>c.type==='confirm'&&c.guessId===g.id)}:{})})),...(guessCommand?{command:guessCommand}:{}),placeholder:SDK.text("presentation.45ed96f67ee2")},
  roundResult:phase==='result'||!active?{answer:d.word,accepted:d.accepted,winner:d.winner,artist,protests:d.protests,required:d.protestRequired}:null,
  controls:p.actions.filter(c=>c.type!=='confirm'&&c.type!=='stop'&&c.type!=='vote-no').map(c=>({command:c,label:c.type==='award'?SDK.text("presentation.366b4e150c1c")+(Number(c.player)+1):c.type==='stop'?(Number(d.voteDeadline)>0?SDK.text("presentation.73d6a7acbc00"):SDK.text("presentation.32ed9f9f917d")):c.type==='protest'?SDK.text("presentation.6f00f2f9da97"):SDK.text("presentation.64b62af6e9fa")}))
 };
 }
};
globalThis.PlayroomPackPresentation=presentation;
