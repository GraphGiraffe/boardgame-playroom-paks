// @ts-check
/** @type {import('../sdk/contracts').Presentation} */
const presentation={
 metadata:{name:{key:'kaly.name'},rules:[
  'Рисующий получает тайное слово и 3 секунды на подготовку. Рисование длится от 30 до 180 секунд. Затем ещё 15 секунд можно угадывать, но рисовать уже нельзя.',
  'Точная догадка приносит 1 очко и сразу завершает раунд. Рисующий видит анонимные варианты и может принять подходящий вручную. Только ведущий может сдаться во время последних 15 секунд.',
  'Ответы можно писать анонимно или с именами. В устном режиме отвечают вслух, а рисующий выбирает угадавшего. Сказанное не записывается.',
  'Результат виден 12 секунд. Против ручного принятия голосуют все, кроме рисовавшего и победителя. Кворум: до 3 голосующих — единогласно; 4–6 — все, кроме одного; 7–9 — все, кроме двух; 10–12 — все, кроме трёх. Успешный протест отменяет всю награду и снимает очко с художника.',
  'В режиме раундов играют 10, 20, 30 или бесконечно; победитель рисует следующим. В режиме кругов каждый рисует один раз за круг, всего 2–5 кругов.',
  'Голосовать за остановку можно в любой фазе. Первое предложение открывает 30-секундное окно. Незавершённое голосование истекает, рисунок и таймер не прерываются. После кворума завершится текущий раунд, а при игре по очереди — полный текущий круг.',
  'Дополнительные опции выключены: лимит 12/24/48 операций холста (заливка и очистка тоже считаются); одна догадка на игрока за раунд; дополнительное очко за точный ответ.'
 ]},
 action(command){if(command.type==='vote-stop')return 'Завершить после раунда / круга';if(command.type==='give-up')return 'Сдаться';if(command.type==='protest')return 'Опротестовать принятие';if(command.type==='award')return {key:'kaly.award',params:{player:{kind:'player-reference',index:Number(command.player)}}};if(command.type==='accept')return 'Принять вариант '+command.guessId;return String(command.type);},
 event:event=>({message:typeof event==='object'&&event!==null&&!Array.isArray(event)&&event.type==='kaly.phase'?'Следующая фаза':'Игра обновлена'}),
 scene(projection){const d=projection.data,scores=/** @type {number[]} */(SDK.read(d,'scores')),guesses=/** @type {{id:string,text:string,player?:number}[]} */(SDK.read(d,'guesses')),phase=String(SDK.read(d,'phase')),draw=(projection.inputs||[]).find(input=>input.command.type==='draw'),guess=(projection.inputs||[]).find(input=>input.command.type==='guess'),labels={prepare:'Подготовка',drawing:'Рисование',guessing:'Последние догадки',result:'Результат',finished:'Игра завершена'};
 return {contractVersion:1,id:'kalyakodil-b',family:'drawing',
  prompt:String(SDK.read(d,'answer')),
  ...(Number(SDK.read(d,'stopDeadline'))>0?{vote:{id:'stop-'+String(SDK.read(d,'voteSequence')),title:'Завершить после раунда / круга?',deadline:Number(SDK.read(d,'stopDeadline')),eligible:Array.from({length:projection.playerCount},(_,n)=>n),voted:/** @type {number[]} */(SDK.read(d,'votes')),required:Number(SDK.read(d,'stopQuorum')),accepted:Boolean(SDK.read(d,'stopRequested')),...(projection.actions.some(c=>c.type==='vote-stop')?{command:projection.actions.find(c=>c.type==='vote-stop')}:{})}}:{}),
  clock:{phase,deadline:Number(SDK.read(d,'deadline')),label:labels[/** @type {keyof typeof labels} */(phase)]||phase},
  players:Array.from({length:projection.playerCount},(_,player)=>({player,metrics:[{label:{key:'kaly.score'},value:scores[player]},{label:{key:'kaly.artist'},value:player===SDK.read(d,'artist')?'Да':'—'}]})),
  rows:[{label:'Раунд / круг',cells:[{value:String(SDK.read(d,'round'))+' / '+String(SDK.read(d,'cycle'))}]},{label:'Остановка',cells:[{value:String((/** @type {number[]} */(SDK.read(d,'votes'))).length)+' / '+String(SDK.read(d,'stopQuorum'))+(SDK.read(d,'stopRequested')?' · принята':'')}]},{label:'Операции холста',cells:[{value:String((/** @type {unknown[]} */(SDK.read(d,'ink'))).length)+(SDK.read(d,'strokeLimit')?' / '+String(SDK.read(d,'strokeLimit')):'')}]}],
  canvas:{id:'drawing-'+String(SDK.read(d,'round')),operations:/** @type {import('../sdk/contracts').JSONValue[]} */(SDK.read(d,'ink')),enabled:!!draw,...(draw?{command:draw.command}:{})},
  chat:{messages:guesses.map(g=>({id:g.id,text:g.text,...(g.player===undefined?{}:{player:g.player}),...(projection.actions.some(c=>c.type==='accept'&&c.guessId===g.id)?{confirmCommand:projection.actions.find(c=>c.type==='accept'&&c.guessId===g.id)}:{})})),...(guess?{command:guess.command}:{}),placeholder:SDK.read(d,'singleGuess')?'Одна попытка: ваш ответ':'Ваш вариант'},
  roundResult:['result','finished'].includes(phase)?{answer:String(SDK.read(d,'answer')),accepted:String(SDK.read(d,'accepted')),winner:Number(SDK.read(d,'winner')),artist:Number(SDK.read(d,'artist')),protests:SDK.read(d,'protests'),required:Number(SDK.read(d,'protestRequired')),overturned:SDK.read(d,'overturned')}:null
 };}
};
globalThis.PlayroomPackPresentation=presentation;
