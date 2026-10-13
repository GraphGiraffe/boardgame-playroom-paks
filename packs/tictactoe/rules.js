(function(E){
  'use strict';
  const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  E.register({id:'tictactoe',version:'0.1.1',name:'Крестики-нолики',min:2,max:2,scoreLabel:'победы',
    description:'Поставьте три знака в линию на поле 3×3.',
    presets:[{id:'classic',label:'Классика · 3×3'}],
    rules:['Первый игрок ставит крестики, второй — нолики.','Побеждает первый, кто соберёт три знака в строке, столбце или по диагонали.','Заполненное поле без линии означает ничью.'],
    create(s,o={}){s.turn=o.resolvedFirstPlayer??0;s.data={board:Array(9).fill(null),marks:s.players.map((_,i)=>i===s.turn?'X':'O')};},
    validateState(s){const d=s.data;E.assertState(Array.isArray(d.board)&&d.board.length===9&&d.board.every(v=>v===null||v===0||v===1),'поле');E.assertState(Array.isArray(d.marks)&&d.marks.length===2&&new Set(d.marks).size===2&&d.marks.every(x=>x==='X'||x==='O'),'знаки');},
    legal(s){return s.data.board.flatMap((v,cell)=>v===null?[{type:'place',cell,label:`Клетка ${cell+1}` }]:[]);},
    apply(s,actor,a){s.data.board[a.cell]=actor;E.event(s,`${s.players[actor].name}: ${s.data.marks[actor]} в клетку ${a.cell+1}`,actor,'move');if(lines.some(line=>line.every(i=>s.data.board[i]===actor)))E.finish(s,actor,`${s.players[actor].name} собрал три в ряд`);else if(s.data.board.every(v=>v!==null))E.finish(s,null,'Ничья: поле заполнено');else s.turn=1-actor;},
    bot(s,actor,actions){const b=s.data.board,win=who=>actions.find(a=>{const n=b.slice();n[a.cell]=who;return lines.some(line=>line.every(i=>n[i]===who));});return win(actor)||win(1-actor)||actions.find(a=>a.cell===4)||actions[0];}
  });
})(globalThis.TabletopCore);
