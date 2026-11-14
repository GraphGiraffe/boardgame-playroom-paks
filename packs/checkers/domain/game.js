(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory;root.PlayroomPackDefinitionFactory=factory;})(globalThis,function(ports,B){
 'use strict';const {captures,moves,positionKey}=B;
 const fact=(name,actor,params={})=>({type:'checkers.'+name,actor,params,visibility:{kind:'public'}});
 function create({playerCount,firstPlayer,preset,rng}){
  const board=Array(64).fill(null),rows=preset==='quick'?2:3;
  for(let row=0;row<8;row++)for(let col=0;col<8;col++)if((row+col)%2&&(row<rows||row>=8-rows))board[row*8+col]={id:'checker-'+(row*8+col),owner:row<rows?1-firstPlayer:firstPlayer,king:false};
  const position={playerCount,turn:firstPlayer,status:'playing',winners:[],rng,preset,data:{lightPlayer:firstPlayer,board,forced:null,captured:[],quiet:0,repetitions:{}}};
  position.data.repetitions[positionKey(position)]=1;return position;
 }
 function validate(s){const check=value=>{if(!value)throw Error('CHECKERS_POSITION_INVALID');};try{

      const d = s.data;
      check(d.lightPlayer===undefined||[0,1].includes(d.lightPlayer),'цвет шашек');
      check(Array.isArray(d.board) && d.board.length === 64 && Array.isArray(d.captured));
      const pieces = d.board.filter(p => p !== null);
      check(pieces.length <= (s.preset === 'quick' ? 16 : 24) && pieces.every(p => p && typeof p.id === 'string' && /^checker-\d+$/.test(p.id) && [0, 1].includes(p.owner) && typeof p.king === 'boolean'));
      check(new Set(pieces.map(p => p.id)).size === pieces.length && d.board.every((p, i) => !p || (Math.floor(i / 8) + i % 8) % 2 === 1));
      check(d.forced === null || (Number.isInteger(d.forced) && d.forced >= 0 && d.forced < 64 && d.board[d.forced]?.owner === s.turn));
      check(new Set(d.captured).size === d.captured.length && d.captured.every(i => Number.isInteger(i) && i >= 0 && i < 64 && d.board[i]?.owner === 1 - s.turn));
      check((d.forced !== null) === (d.captured.length > 0) && (d.forced === null || captures(d, d.forced).length > 0));
      check(Number.isInteger(d.quiet) && d.quiet >= 0 && d.quiet <= 30 && d.repetitions && typeof d.repetitions === 'object' && !Array.isArray(d.repetitions) && Object.values(d.repetitions).every(n => Number.isInteger(n) && n >= 1 && n <= 3));

 return true;}catch(_){return false;}}
 function actions(position,actor){if(position.status!=='playing'||position.turn!==actor)return [];
  return moves(position,actor).map(move=>({command:{type:'move',from:move.from,to:move.to},visibility:'public'}));}
 function reduce(position,actor,action){const next=JSON.parse(JSON.stringify(position)),d=next.data,events=[];
  const move=moves(next,actor).find(move=>move.from===action.from&&move.to===action.to),piece=d.board[action.from],wasKing=piece.king;
  d.board[action.to]=piece;d.board[action.from]=null;
  if(Math.floor(action.to/8)===(actor===(d.lightPlayer??0)?0:7))piece.king=true;
  const target=move.victim!==null?d.board[move.victim].owner:null;
  if(move.victim!==null)d.captured.push(move.victim);
  events.push(fact('moved',actor,{from:action.from,to:action.to,captured:move.victim!==null,target,promoted:piece.king&&!wasKing}));
  if(move.victim!==null&&captures(d,action.to).length){d.forced=action.to;return {position:next,events,turnEnded:false};}
  d.quiet=!d.captured.length&&wasKing?d.quiet+1:0;
  for(const victim of d.captured)d.board[victim]=null;
  d.captured=[];d.forced=null;next.turn=1-actor;
  if(!moves(next,next.turn).length){next.status='finished';next.winners=[actor];events.push(fact('won',actor));}
  else{const key=positionKey(next);d.repetitions[key]=(d.repetitions[key]||0)+1;
   if(d.repetitions[key]>=3||d.quiet>=30){next.status='finished';events.push(fact(d.repetitions[key]>=3?'repeated':'quiet',null));}}
  return {position:next,events,turnEnded:true};
 }
 const project=position=>JSON.parse(JSON.stringify(position.data));
 function bot(s,actor,actions,memory,context={}){

      const candidates = actions.map(a => {
        const piece = s.data.board[a.from], row = Math.floor(a.to / 8), col = a.to % 8;
        const promotion = !piece.king && row === (actor === (s.data.lightPlayer??0) ? 0 : 7);
        let risk = 0;
        const trial = JSON.parse(JSON.stringify(s.data)); trial.board[a.to] = trial.board[a.from]; trial.board[a.from] = null;
        const take = moves(s, actor).find(m => m.from === a.from && m.to === a.to);
        if (take.victim != null) trial.board[take.victim] = null;
        if (promotion) trial.board[a.to].king = true;
        trial.captured = [];
        for (let i = 0; i < 64; i++) if (trial.board[i]?.owner === 1 - actor && captures(trial, i).some(m => m.victim === a.to)) risk = 5;
        return { a, value: (promotion ? 10 : 0) + (take.victim != null ? 4 : 0) - risk*({1:0,2:1,3:1.6}[context.depth??2]) + (piece.king ? 0 : (actor === (s.data.lightPlayer??0) ? 7 - row : row) * 0.15) + (col > 1 && col < 6 ? 0.1 : 0) };
      });
      const best = Math.max(...candidates.map(c => c.value));
      const chosen = candidates.filter(c => c.value === best);
      return chosen[Math.floor((context.random?.()??0)*chosen.length)].a;

 }
 function result(position){const values=Array.from({length:2},(_,player)=>position.winners.includes(player)?1:0);
  return {winners:position.winners,lastPlayers:position.winners.length===1?[1-position.winners[0]]:[],places:values.map(value=>1+new Set(values.filter(other=>other>value)).size),metrics:[{id:'wins',values}]};}
 function localChoices(p){if(p.actor<0||p.status!=='playing')return [];return actions(p,p.actor);}
 return Object.freeze({contractVersion:1,id:'checkers',minPlayers:2,maxPlayers:2,create,validate,actions,localChoices,reduce,project,bot,result});
});
