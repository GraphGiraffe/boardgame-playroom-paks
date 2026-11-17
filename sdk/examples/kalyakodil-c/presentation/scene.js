// @ts-check
/** @typedef {import('../sdk/contracts').JSONValue} SceneValue */
/** @typedef {{[key:string]:SceneValue}} Row */
/** @type {import('../sdk/contracts').Presentation} */
const presentation={
 metadata:{name:'Калякодил C · Мастерская',rules:[
 'Рисуйте и угадывайте\nХудожник получает тайное слово и 3 секунды на подготовку. Затем рисует от 30 до 180 секунд. Остальные отправляют варианты. Точное слово без учёта регистра, лишних пробелов и различия ё/е приносит угадавшему 1 очко.',
 'Ответы\nВ анонимном режиме отправитель варианта скрыт. В именном режиме видно, кто ответил. В устном режиме художник отмечает угадавшего игрока; в результате будет указано «Устный ответ».\n',
 'После рисунка\nЕщё 15 секунд можно угадывать, но рисовать уже нельзя. Ведущий может закончить этот этап без очков. Художник может принять близкий по смыслу вариант; в анонимном режиме отправитель скрыт.',
 'Спорный ответ\nИтог показывает исходное и принятое слово. За 12 секунд остальные, кроме художника и победителя, могут протестовать. Почти все — все до 3 голосующих, все кроме 1 до 6, кроме 2 до 9, кроме 3 до 12; минимум 1. Протест снимает очко угадавшего, бонус художника и ещё 1 очко художника.',
 'Длина партии\nИграйте 10, 20, 30 раундов или бесконечно. Угадавший рисует следующим, после неудачи или протеста выбирается другой случайный. В режиме кругов каждый рисует один раз за круг, всего 2–5 кругов. Голоса почти всех за остановку завершают текущий раунд или полный круг.',
 'Три опции\nПодсказка длины показывает число букв. Неверная догадка может стоить 1 очко; штрафы показываются только в итоге раунда, сохраняя анонимность во время рисования. Принятый вручную ответ возвращает штраф, а протест отменяет этот возврат. Быстрое угадывание в первой половине основного времени может дать художнику дополнительное очко. Все три опции изначально выключены.'
 ]},
 action:(c,p)=>c.type==='award'?'Угадал игрок №'+(Number(c.player)+1):c.type==='stop'?(Number(p.data.voteDeadline)>0?'Поддержать завершение':'Предложить завершение'):c.type==='protest'?'Оспорить ответ':c.type==='give-up'?'Закончить догадки':c.type==='confirm'?'Принять вариант №'+c.guessId:c.type==='draw'?'Рисовать':'Отправить вариант',
 event:()=>({message:'Ход принят'}),
 /** @returns {import('../sdk/contracts').Scene} */
 scene(p){const d=p.data,artist=Number(SDK.read(d,'artist')),roundId=Number(SDK.read(d,'roundId')),phase=String(SDK.read(d,'phase')),active=p.status==='playing',guesses=/** @type {Row[]} */(SDK.read(d,'guesses')),scores=/** @type {number[]} */(SDK.read(d,'scores'));
 const command=(/** @type {string} */type)=>p.actions.find(c=>c.type===type)||null;
 const input=(/** @type {string} */type)=>(p.inputs||[]).find(choice=>choice.command.type===type)?.command||null;
 const drawCommand=input('draw'),guessCommand=input('guess');
 return {contractVersion:1,id:'kalyakodil-c',family:'drawing',menuActions:p.actions.filter(c=>c.type==='stop').map(command=>({command,label:'Предложить завершение'})),geometry:{topology:'drawing'},zones:[{id:'field',kind:'table'},{id:'canvas',kind:'canvas'}],objects:[],interactions:[],
  players:Array.from({length:p.playerCount},(_,player)=>({player,metrics:[{id:'points',kind:'points',value:scores[player],label:'Очки'}]})),
  prompt:d.word?String(d.word):Number(d.wordLength)>0?'Букв: '+d.wordLength:'Угадайте рисунок',
  ...(Number(d.voteDeadline)>0||d.stopPending===true?{vote:{against:/** @type {number[]} */(d.stopAgainst||[]),...(p.actions.find(c=>c.type==='vote-no')?{againstCommand:p.actions.find(c=>c.type==='vote-no')}:{}) ,id:'stop-'+d.voteDeadline,title:'Завершить после раунда / круга',deadline:Number(d.voteDeadline),startedAt:Math.max(0,Number(d.voteDeadline)-30000),eligible:Array.from({length:p.playerCount},(_,i)=>i),voted:/** @type {number[]} */(d.stopVotes),required:Number(d.stopRequired),accepted:d.stopPending===true,...(command('stop')?{command:/** @type {import('../sdk/contracts').Command} */(command('stop'))}:{})}}:{}),
  canvas:{id:'drawing-'+roundId,operations:/** @type {SceneValue[]} */(SDK.read(d,'operations')),enabled:!!drawCommand,...(drawCommand?{command:drawCommand}:{})},
  clock:{phase,deadline:Number(SDK.read(d,'deadline')),startedAt:Number(d.phaseStartedAt),player:artist,label:phase==='prepare'?'Подумайте':phase==='drawing'?'Рисование':phase==='guessing'?'Последние догадки':'Просмотр и протест'},
  chat:{messages:guesses.map(g=>({id:String(g.id),text:String(g.text),...(g.player===undefined?{}:{player:Number(g.player)}),...(p.actions.some(c=>c.type==='confirm'&&c.guessId===g.id)?{confirmCommand:p.actions.find(c=>c.type==='confirm'&&c.guessId===g.id)}:{})})),...(guessCommand?{command:guessCommand}:{}),placeholder:'Введите слово'},
  roundResult:phase==='result'||!active?{answer:d.word,accepted:d.accepted,winner:d.winner,artist,protests:d.protests,required:d.protestRequired}:null,
  controls:p.actions.filter(c=>c.type!=='confirm'&&c.type!=='stop'&&c.type!=='vote-no').map(c=>({command:c,label:c.type==='award'?'Угадал игрок №'+(Number(c.player)+1):c.type==='stop'?(Number(d.voteDeadline)>0?'Поддержать завершение':'Предложить завершение'):c.type==='protest'?'Протест':'Сдаёмся'}))
 };
 }
};
globalThis.PlayroomPackPresentation=presentation;
