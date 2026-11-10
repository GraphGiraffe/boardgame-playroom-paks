(function (root, factory) {
  'use strict';
  const definition = factory();
  if (typeof module === 'object' && module.exports) module.exports = definition;
  root.PlayroomPackDefinition = definition;
})(globalThis, function () {
  'use strict';
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const wins = (board, owner) => lines.some(line => line.every(cell => board[cell] === owner));
  const event = (type, actor, params = {}) => ({type:'tictactoe.' + type, actor, params, visibility:{kind:'public'}});
  function create({playerCount, firstPlayer, preset}) {
    if (playerCount !== 2 || ![0,1].includes(firstPlayer) || preset !== 'classic') {
      const error = new Error('TICTACTOE_OPTIONS_INVALID'); error.code = error.message; throw error;
    }
    return {playerCount, turn:firstPlayer, status:'playing', winners:[],
      data:{board:Array(9).fill(null), marks:firstPlayer === 0 ? ['X','O'] : ['O','X']}};
  }
  function validate(position) {
    const {data, turn, status, winners} = position;
    if (Object.keys(data).sort().join(',') !== 'board,marks' ||
      !Array.isArray(data.board) || data.board.length !== 9 || !data.board.every(value => value === null || value === 0 || value === 1) ||
      !Array.isArray(data.marks) || data.marks.length !== 2 || !['X,O','O,X'].includes(data.marks.join(','))) return false;
    const first = data.marks.indexOf('X'), second = 1 - first;
    const a = data.board.filter(value => value === first).length, b = data.board.filter(value => value === second).length;
    if (a < b || a > b + 1 || a > 5 || b > 4) return false;
    const winning = [0,1].filter(owner => wins(data.board, owner)), full = a + b === 9;
    if (status === 'playing') return !winning.length && !full && !winners.length && turn === (a === b ? first : second);
    if (winning.length > 1) return false;
    if (winning.length === 1) {
      const winner = winning[0];
      return winners.length === 1 && winners[0] === winner && turn === winner &&
        (winner === first ? a === b + 1 : a === b);
    }
    return full && !winners.length && turn === first;
  }
  function actions(position, actor) {
    if (position.status !== 'playing' || actor !== position.turn) return [];
    return position.data.board.flatMap((owner, cell) => owner === null
      ? [{command:{type:'place', cell}, visibility:'public'}] : []);
  }
  function reduce(position, actor, action) {
    const board = [...position.data.board]; board[action.cell] = actor;
    const events = [event('placed', actor, {cell:action.cell, mark:position.data.marks[actor]})];
    const won = wins(board, actor), draw = !won && board.every(owner => owner !== null);
    if (won) events.push(event('won', actor));
    if (draw) events.push(event('draw', null));
    return {turnEnded:true,position:{playerCount:2, turn:won || draw ? actor : 1 - actor,
      status:won || draw ? 'finished' : 'playing', winners:won ? [actor] : [],
      data:{board, marks:[...position.data.marks]}}, events};
  }
  function project(position) { return {board:[...position.data.board], marks:[...position.data.marks]}; }
  function bot(projection, actor, choices, memory, context={}) {
    const winningMove = owner => choices.find(action => {
      const board = [...projection.data.board]; board[action.cell] = owner; return wins(board, owner);
    });
    const depth=context.depth??2,random=context.random||(()=>0);
    if(depth===3){
      const cache=new Map();
      const search=(board,turn)=>{const key=board.map(v=>v===null?'.':v).join('')+turn;if(cache.has(key))return cache.get(key);if(wins(board,actor))return 1;if(wins(board,1-actor))return -1;const cells=board.flatMap((v,i)=>v===null?[i]:[]);if(!cells.length)return 0;const scores=cells.map(i=>{const next=[...board];next[i]=turn;return search(next,1-turn);});const value=turn===actor?Math.max(...scores):Math.min(...scores);cache.set(key,value);return value;};
      const scored=choices.map(action=>{const board=[...projection.data.board];board[action.cell]=actor;return {action,score:search(board,1-actor)};}),best=Math.max(...scored.map(v=>v.score)),pool=scored.filter(v=>v.score===best);return pool[Math.floor(random()*pool.length)].action;
    }
    return winningMove(actor)||winningMove(1-actor)||(depth>1?choices.find(action=>action.cell===4):null)||choices[Math.floor(random()*choices.length)];
  }
  function result(position) {
    const values = [0,1].map(owner => position.winners.includes(owner) ? 1 : 0);
    return {winners:[...position.winners], places:values.map(value => values.some(other => other > value) ? 2 : 1),
      metrics:[{id:'wins', values}]};
  }
  function localChoices(p){if(p.actor<0||p.status!=='playing')return [];return actions(p,p.actor);}
 return Object.freeze({contractVersion:1, id:'tictactoe', minPlayers:2, maxPlayers:2,
    create, validate, actions,localChoices, reduce, project, bot, result});
});
