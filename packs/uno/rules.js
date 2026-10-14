(function (E) {
  'use strict';
  const colors = ['red', 'yellow', 'green', 'blue'];
  const names = { red: 'красный', yellow: 'жёлтый', green: 'зелёный', blue: 'синий', wild: 'чёрный' };
  const title = card => ({ skip: 'Пропуск', reverse: 'Разворот', '+2': '+2', wild: 'Смена цвета', '+4': '+4' }[card.value] || card.value);
  const nextPlayer = (s, from, steps = 1) => (from + s.data.direction * steps + s.players.length * 4) % s.players.length;
  const reactionTypes = ['declare-uno', 'accuse-uno'];
  function unoState(s) { return s.data.uno || { mode: 'auto', declared: s.players.map(() => false), pending: null, episode: 0, calls: [], penalties: [] }; }
  function situations(s) {
    const u=unoState(s);
    return u.situations||s.players.map((_,i)=>({episode:u.episode||0,open:u.mode==='manual'&&s.data.hands[i].length===1&&!u.declared[i],settled:(u.penalties||[]).includes(i),called:(u.calls||[]).includes(i)}));
  }
  function syncPending(s) {
    const u=s.data.uno;
    for(let i=0;i<u.situations.length;i++)if(s.status!=='playing'||s.data.hands[i].length!==1||u.declared[i])u.situations[i].open=false;
    u.pending=u.situations.map((w,i)=>w.open?i:null).filter(i=>i!==null).at(-1)??null;
  }
  function draw(s, who, count) {
    const d = s.data, received = [];
    for (let n = 0; n < count; n++) {
      if (!d.drawPile.length && d.discard.length > 1) {
        const top = d.discard.pop();
        d.drawPile = E.shuffle(d.discard, s);
        d.discard = [top];
      }
      if (!d.drawPile.length) break;
      const card = d.drawPile.pop(); d.hands[who].push(card); received.push(card);
    }
    if (d.uno && d.hands[who].length !== 1) {
      d.uno.declared[who] = false;
      if(d.uno.situations){const situation=d.uno.situations[who];if(situation.open)situation.settled=true;situation.open=false;}
      if (d.uno.pending === who) d.uno.pending = null;
    }
    return received;
  }
  function penalty(s, who, notice) {
    const cards = draw(s, who, 2);
    E.event(s, `${s.players[who].name} берёт ${cards.length} штрафных карт${cards.length < 2 ? ': колода опустела' : ''}`, who, 'draw', { sound: { id: 'penalty', target: who }, ...(notice?{notice:{title:notice.title,detail:notice.detail(cards.length),tone:notice.tone}}:{}) });
  }
  function react(s, actor, action) {
    const d = s.data, u = d.uno, name = s.players[actor].name;
    if (action.type === 'declare-uno') {
      if(!(u.calls||[]).includes(actor))(u.calls ||= []).push(actor);
      u.situations[actor].called=true;
      if (d.hands[actor].length === 1) {
        u.declared[actor] = true;
        u.situations[actor].open=false;u.situations[actor].settled=true;
        E.event(s, `${name}: UNO!`, actor, 'uno', { sound: { id: 'uno.call' },speech:{speaker:actor,text:'UNO!',result:'success'},notice:{title:`${name}: UNO!`,detail:'Осталась одна карта',tone:'success'} });
      } else {
        u.declared[actor] = false;
        E.event(s, `${name} ошибочно объявляет UNO: в руке ${d.hands[actor].length} карт. Без штрафа за раннее объявление.`, actor, 'false-uno', { sound: { id: 'uno.call' },speech:{speaker:actor,text:'UNO!',result:'error'},notice:{title:`${name}: UNO! слишком рано`,detail:'За ранний выкрик штрафа нет',tone:'warning'} });
      }
      syncPending(s);return;
    }
    const target = action.target, targetName = s.players[target].name;
    if(!(u.penalties||[]).includes(target))(u.penalties ||= []).push(target);
    const situation=u.situations[target];situation.settled=true;
    if (situation.open && d.hands[target].length === 1 && !u.declared[target]) {
      situation.open=false;
      E.event(s, `${name} поймал ${targetName}: UNO не объявлено`, actor, 'uno-caught', { target,speech:{speaker:actor,target,text:'UNO!',result:'success'} });
      penalty(s, target,{title:`${targetName} пропустил UNO!`,detail:count=>`${name} прав · штраф ${targetName}: +${count} карт`,tone:'warning'});
    } else {
      const reason = d.hands[target].length !== 1 ? `у ${targetName} ${d.hands[target].length} карт, а не одна` : u.declared[target] ? `${targetName} уже объявил UNO` : 'ситуация уже закрыта';
      E.event(s, `${name} ошибочно обвиняет ${targetName}: ${reason}. Штраф обвиняющему — 2 карты.`, actor, 'false-accusation', { target,speech:{speaker:actor,target,text:'UNO!',result:'error'} });
      penalty(s, actor,{title:'Ложное обвинение UNO!',detail:count=>`${name}: штраф +${count} карт`,tone:'danger'});
    }
    syncPending(s);
  }
  function canPlay(s, actor, card) {
    const d = s.data, top = d.discard[d.discard.length - 1];
    if (d.drawn != null && d.drawn !== card.id) return false;
    if (card.value === '+4') return !d.hands[actor].some(c => c.color === d.color);
    return card.color === 'wild' || card.color === d.color || card.value === top.value;
  }
  E.register({
    id: 'uno', version:'0.4.8', name: 'UNO', min: 2, max: 4, scoreLabel: 'очки',
    description: 'Цвета, цифры и внезапные развороты. Освободите руку первым.',
    presets: [{ id: 'classic', label: 'Классика · 7 карт' }, { id: 'quick', label: 'Быстро · 5 карт' }],
    rules: ['Совпадение по цвету или значению; чёрная карта меняет цвет.', 'После добора можно сыграть только взятую карту или пропустить ход.', '+4 разрешена, если нет карт текущего цвета. Без накопления штрафов и оспаривания.', 'Штраф последней карты применяется. Первый сброс — цифровая карта.', 'В настройках партии по умолчанию выбран ручной выкрик UNO; можно переключить на автоматическое объявление.', 'В ручном режиме нажмите «UNO!» при одной карте. Чтобы обвинить соперника в пропуске выкрика, коснитесь его имени или руки, затем нажмите кнопку «UNO!» в меню игрока. Каждого забывшего можно поймать, пока у него одна карта и он не объявил UNO; чужие ходы не закрывают ситуацию. Штраф — 2 карты.', 'После показа хода человеку даётся 1 секунда защиты от обвинений других людей по сети и 3 секунды от ботов. Раннее обвинение не действует и не штрафуется. Повторные и запоздалые реакции не наказываются.', 'Для каждого обвиняемого в одном эпизоде назначается не более одного штрафа: забывшему UNO — 2 карты; за настоящее ложное обвинение — 2 карты только первому обвинителю. Повторное UNO не создаёт ход; раннее объявление без одной карты — запись без штрафа.', 'Числа дают номинал, действия — 20, чёрные карты — 50 очков победителю.'],
    create(s, options = {}) {
      if(options.resolvedFirstPlayer!=null)s.turn=options.resolvedFirstPlayer;
      if (options.unoMode !== undefined && !['auto', 'manual'].includes(options.unoMode)) throw Error('Неизвестный режим объявления UNO');
      let deck = [], id = 0;
      for (const color of colors) {
        deck.push({ id: `u${id++}`, color, value: '0' });
        for (const value of ['1','2','3','4','5','6','7','8','9','skip','reverse','+2']) for (let n = 0; n < 2; n++) deck.push({ id: `u${id++}`, color, value });
      }
      for (const value of ['wild', '+4']) for (let n = 0; n < 4; n++) deck.push({ id: `u${id++}`, color: 'wild', value });
      deck = E.shuffle(deck, s);
      const hands = s.players.map(() => []);
      for (let n = 0; n < (s.preset === 'quick' ? 5 : 7); n++) for (const hand of hands) hand.push(deck.pop());
      const first = deck.findIndex(c => /^\d$/.test(c.value)), discard = [deck.splice(first, 1)[0]];
      s.data = { hands, drawPile: deck, discard, color: discard[0].color, direction: 1, drawn: null, noDraw: false, stalled: 0, uno: { mode: options.unoMode || 'auto', declared: s.players.map(() => false), pending: null, episode: 0, calls: [], penalties: [] } };
    },
    validateState(s) {
      const d = s.data;
      E.assertState(Array.isArray(d.hands) && d.hands.length === s.players.length, 'руки UNO');
      const values = ['1','2','3','4','5','6','7','8','9','skip','reverse','+2'];
      E.validateComponents([...d.hands, d.drawPile, d.discard], c => {
        if (typeof c.id !== 'string' || !/^u\d+$/.test(c.id)) return false;
        const id = Number(c.id.slice(1));
        if (id < 0 || id > 107) return false;
        if (id >= 100) return c.color === 'wild' && c.value === (id < 104 ? 'wild' : '+4');
        const offset = id % 25;
        return c.color === colors[Math.floor(id / 25)] && c.value === (offset ? values[Math.floor((offset - 1) / 2)] : '0');
      }, 108);
      E.assertState(d.discard.length > 0 && colors.includes(d.color) && [1, -1].includes(d.direction), 'сброс и направление UNO');
      E.assertState(typeof d.noDraw === 'boolean' && Number.isInteger(d.stalled) && d.stalled >= 0 && d.stalled <= s.players.length, 'добор UNO');
      E.assertState(d.drawn === null || (typeof d.drawn === 'string' && d.hands[s.turn].some(c => c.id === d.drawn)), 'взятая карта UNO');
      E.assertState(!(d.noDraw && d.drawn !== null), 'двойной статус добора UNO');
      if (d.uno !== undefined) {
        const u = d.uno;
        E.assertState(u && ['auto', 'manual'].includes(u.mode) && Array.isArray(u.declared) && u.declared.length === s.players.length && u.declared.every(value => typeof value === 'boolean'), 'объявления UNO');
        E.assertState(u.declared.every((value, player) => !value || d.hands[player].length === 1), 'объявление UNO без одной карты');
        E.assertState(u.pending === null || (u.mode === 'manual' && s.status === 'playing' && Number.isInteger(u.pending) && u.pending >= 0 && u.pending < s.players.length && d.hands[u.pending].length === 1 && !u.declared[u.pending]), 'окно обвинения UNO');
        E.assertState(u.situations===undefined||(Array.isArray(u.situations)&&u.situations.length===s.players.length&&u.situations.every((w,i)=>w&&Number.isSafeInteger(w.episode)&&w.episode>=0&&w.episode<=s.move&&['open','settled','called'].every(k=>typeof w[k]==='boolean')&&(!w.open||(u.mode==='manual'&&d.hands[i].length===1&&!u.declared[i]&&!w.settled)))), 'ситуации UNO');
        E.assertState(u.episode === undefined || (Number.isSafeInteger(u.episode) && u.episode >= 0 && u.episode <= s.move), 'эпизод UNO');
        E.assertState(u.calls === undefined || (Array.isArray(u.calls) && new Set(u.calls).size === u.calls.length && u.calls.every(p => Number.isInteger(p) && p >= 0 && p < s.players.length)), 'реакции UNO');
        E.assertState(u.penalties === undefined || (Array.isArray(u.penalties) && new Set(u.penalties).size===u.penalties.length && u.penalties.every(p=>Number.isInteger(p)&&p>=0&&p<s.players.length)), 'штрафы ситуаций UNO');
      }
    },
    legal(s, actor) {
      const d = s.data, actions = [];
      for (const card of d.hands[actor]) if (canPlay(s, actor, card)) {
        if (card.color === 'wild') for (const color of colors) actions.push({ type: 'play', card: card.id, color, label: `${title(card)} → ${names[color]}` });
        else actions.push({ type: 'play', card: card.id, label: `${names[card.color]} ${title(card)}` });
      }
      actions.push(d.drawn != null || d.noDraw ? { type: 'pass', label: 'Завершить ход' } : { type: 'draw', label: 'Взять карту' });
      return actions;
    },
    reactionWindows(s) {
      const u=unoState(s);
      if(u.mode!=='manual'||s.status!=='playing')return [];
      return situations(s).flatMap((w,owner)=>w.open&&!w.settled&&!s.players[owner].bot?[{id:`uno:${owner}:${w.episode}`,owner,revision:w.episode,humanMs:1000,botMs:3000,fallbackMs:10000}]:[]);
    },
    reactionControl(s, actor, action) {
      const u = unoState(s);
      if (u.mode !== 'manual') return null;
      if (!reactionTypes.includes(action.type)) return ['play','draw','pass'].includes(action.type) ? {kind:'advance'} : null;
      if (action.type === 'accuse-uno' && (!Number.isInteger(action.target) || action.target < 0 || action.target >= s.players.length || action.target === actor)) return null;
      const target=action.type==='accuse-uno'?action.target:actor, situation=situations(s)[target];
      const episode = situation.episode, supplied = action.episode === undefined ? episode : action.episode;
      if (!Number.isSafeInteger(supplied) || supplied < 0 || supplied > episode) return null;
      const kind = action.type === 'declare-uno' ? 'answer' : 'challenge';
      const ignore = supplied < episode || (kind === 'answer' ? u.declared[actor] || situation.called || situation.settled : situation.settled || u.declared[target]);
      return {kind,episode,target,independent:true,ignore:!!ignore};
    },
    reactions(s, actor) {
      if (unoState(s).mode !== 'manual') return [];
      return [{ type: 'declare-uno', episode: situations(s)[actor].episode, label: 'UNO!', notify: true }, ...s.players.flatMap((player, target) => target === actor ? [] : [{ type: 'accuse-uno', episode: situations(s)[target].episode, target, targetKind: 'player', notify: true, confirmation: 'Обвинить в пропуске UNO? Штраф за ошибку: +2 карты.', targetPrompt: 'UNO!', label: `${player.name} не сказал UNO!` }])];
    },
    apply(s, actor, a) {
      const d = s.data, name = s.players[actor].name;
      d.uno ||= unoState(s);
      d.uno.situations ||= situations(s);
      if (reactionTypes.includes(a.type)) { react(s, actor, a); return; }
      // Only this player's changed hand starts a new situation. Other players'
      // open declarations survive ordinary turns and independent reactions.
      d.uno.episode=s.move;
      if(d.hands[actor].length!==1){d.uno.situations[actor]={episode:s.move,open:false,settled:false,called:false};d.uno.calls=(d.uno.calls||[]).filter(i=>i!==actor);d.uno.penalties=(d.uno.penalties||[]).filter(i=>i!==actor);}
      if (a.type === 'draw') {
        const got = draw(s, actor, 1);
        syncPending(s);
        d.drawn = got[0]?.id || null; d.noDraw = !got.length;
        E.event(s, `${name} ${got.length ? 'берёт карту' : 'не может взять карту: колода пуста'}`, actor, 'draw', { sound: { id: got.length ? 'draw' : 'notify', target: actor } });
        return;
      }
      if (a.type === 'pass') {
        d.stalled = d.noDraw ? d.stalled + 1 : 0;
        d.drawn = null; d.noDraw = false; s.turn = nextPlayer(s, actor);
        E.event(s, `${name} пропускает ход`, actor, 'pass', { sound: { id: 'notify' } });
        if (d.stalled >= s.players.length) E.finish(s, null, 'Ничья: колода пуста, ходов нет');
        syncPending(s);return;
      }
      const at = d.hands[actor].findIndex(c => c.id === a.card), card = d.hands[actor].splice(at, 1)[0];
      d.discard.push(card); d.color = a.color || card.color; d.drawn = null; d.noDraw = false; d.stalled = 0;
      const playSound = card.value === 'skip' || (card.value === 'reverse' && s.players.length === 2)
        ? { id: 'attack.skip', target: nextPlayer(s, actor) }
        : { id: card.value === 'reverse' ? 'reverse' : 'move' };
      E.event(s, `${name}: ${title(card)}, ${names[d.color]}`, actor, 'play', { sound: playSound });
      let steps = 1;
      if (card.value === 'reverse') { d.direction *= -1; if (s.players.length === 2) steps = 2; }
      if (card.value === 'skip') steps = 2;
      if (card.value === '+2' || card.value === '+4') {
        const target = nextPlayer(s, actor), received = draw(s, target, card.value === '+2' ? 2 : 4);
        E.event(s, `${s.players[target].name} берёт ${received.length} и пропускает ход`, target, 'draw', { sound: { id: card.value === '+2' ? 'attack.light' : 'attack.heavy', target } }); steps = 2;
      }
      s.turn = nextPlayer(s, actor, steps);
      d.uno.declared[actor] = false;
      if (d.hands[actor].length === 1) {
        if (d.uno.mode === 'manual') {d.uno.situations[actor]={episode:s.move,open:true,settled:false,called:false};d.uno.pending=actor;}
        else { d.uno.declared[actor] = true; E.event(s, `${name}: UNO!`, actor, 'uno', { sound: { id: 'uno.call' },notice:{title:`${name}: UNO!`,detail:'Автоматическое объявление',tone:'success'} }); }
      }
      if (!d.hands[actor].length) {
        const points = d.hands.flat().reduce((sum, c) => sum + (c.color === 'wild' ? 50 : /^\d$/.test(c.value) ? Number(c.value) : 20), 0);
        E.finish(s, actor, `${name} побеждает: ${points} очков`, points);
      }
      syncPending(s);
    },
    project(out, viewer) { if(out.data.uno){delete out.data.uno.pending;delete out.data.uno.situations;} if (viewer !== out.turn) out.data.drawn = out.data.drawn == null ? null : true; },
    botReaction(s, actor, actions) {
      const u = unoState(s);
      if (s.data.hands[actor].length === 1 && !u.declared[actor] && !(u.calls || []).includes(actor)) return actions.find(a => a.type === 'declare-uno');
      const target=situations(s).findIndex((w,i)=>i!==actor&&w.open&&!w.settled&&!u.declared[i]);
      if(target>=0)return actions.find(a=>a.type==='accuse-uno'&&a.target===target);
      return null;
    },
    bot(s, actor, actions) {
      const d = s.data, plays = actions.filter(a => a.type === 'play');
      if (!plays.length) return actions[0];
      const totals = Object.fromEntries(colors.map(c => [c, d.hands[actor].filter(card => card.color === c).length]));
      return plays.sort((a, b) => {
        const ca = d.hands[actor].find(c => c.id === a.card), cb = d.hands[actor].find(c => c.id === b.card);
        return (cb.color !== 'wild') - (ca.color !== 'wild') || (totals[b.color] || 0) - (totals[a.color] || 0);
      })[0];
    }
  });
})(globalThis.TabletopCore);
