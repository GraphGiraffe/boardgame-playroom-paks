(function(E){
 'use strict';
 E.register({id:'private-counter', version: '0.3.0',name:'Учебный счётчик',min:2,max:4,scoreLabel:'очки',presets:[{id:'classic',label:'Восемь шагов'}],
  create(s,options={}){s.turn=options.resolvedFirstPlayer??0;s.data={count:0,goals:s.players.map((_,i)=>({value:i+2}))};},
  legal(){return [{type:'increment',label:'Добавить 1'}];},
  apply(s,actor){s.data.count++;s.players[actor].score++;
    E.event(s,`Ваша закрытая цель: ${s.data.goals[actor].value}`,actor,'action',{privateTo:actor,publicText:`Счётчик: ${s.data.count}`});
    if(s.data.count>=8){s.status='finished';s.winner=actor;}else s.turn=(actor+1)%s.players.length;
  },
  project(out,viewer){out.data.goals=out.data.goals.map((goal,i)=>i===viewer?goal:{hidden:true});},
  validateState(s){E.assertState(Number.isInteger(s.data.count)&&s.data.count>=0&&s.data.count<=8,'counter');return true;}
 });
})(globalThis.TabletopCore);
