(function (E) {
  'use strict';
  const pips = hand => hand.reduce((n, tile) => n + tile.a + tile.b, 0);
  E.register({
    id: 'domino', version: '0.3.2', name: 'Домино', min: 2, max: 4, scoreLabel: 'очки',
    description: 'Собирайте цепочку. Берегите дубли и считайте оставшиеся точки.',
    presets: [{ id: 'classic', label: 'Классика · 7 костей' }, { id: 'quick', label: 'Быстро · 5 костей' }],
    rules: ['Двойная шестёрка: 28 костей. Соединяйте одинаковое число точек.', 'Начинает игрок с наибольшим дублем; первой можно поставить любую кость.', 'Если хода нет, берите из базара по одной до подходящей кости. Пустой базар — пропуск.', 'Побеждает пустая рука. При рыбе — наименьшая сумма; равенство даёт ничью.', 'Очки победителя — сумма точек на руках соперников.'],
    create(s, options = {}) {
      let stock = [];
      for (let a = 0; a <= 6; a++) for (let b = a; b <= 6; b++) stock.push({ id: `d${a}${b}`, a, b });
      stock = E.shuffle(stock, s);
      const hands = s.players.map(() => []), count = s.preset === 'quick' ? 5 : 7;
      for (let n = 0; n < count; n++) for (const hand of hands) hand.push(stock.pop());
      s.data = { hands, stock, chain: [], passes: 0 };
      let best = -1;
      hands.forEach((hand, player) => hand.forEach(t => { const rank = t.a === t.b ? 100 + t.a : t.a + t.b; if (rank > best) { best = rank; s.turn = player; } }));
      if(options.resolvedFirstPlayer!=null)s.turn=options.resolvedFirstPlayer;
    },
    validateState(s) {
      const d = s.data;
      E.assertState(Array.isArray(d.hands) && d.hands.length === s.players.length, 'руки домино');
      E.validateComponents([...d.hands, d.stock, d.chain], t => Number.isInteger(t.a) && Number.isInteger(t.b) && t.a >= 0 && t.a <= 6 && t.b >= 0 && t.b <= 6 && t.id === `d${Math.min(t.a,t.b)}${Math.max(t.a,t.b)}`, 28);
      E.assertState(Number.isInteger(d.passes) && d.passes >= 0 && d.passes <= s.players.length, 'пропуски домино');
      E.assertState(d.chain.every((tile, i) => i === 0 || d.chain[i - 1].b === tile.a), 'цепочка домино');
    },
    legal(s, actor) {
      const d = s.data, actions = [], left = d.chain[0]?.a, right = d.chain[d.chain.length - 1]?.b;
      for (const t of d.hands[actor]) {
        if (!d.chain.length) actions.push({ type: 'play', card: t.id, side: 'right', label: `Поставить ${t.a}·${t.b}` });
        else {
          if (t.a === left || t.b === left) actions.push({ type: 'play', card: t.id, side: 'left', label: `${t.a}·${t.b} слева` });
          if (t.a === right || t.b === right) actions.push({ type: 'play', card: t.id, side: 'right', label: `${t.a}·${t.b} справа` });
        }
      }
      if (!actions.length) actions.push(d.stock.length ? { type: 'draw', label: 'Взять из базара' } : { type: 'pass', label: 'Пропустить ход' });
      return actions;
    },
    apply(s, actor, a) {
      const d = s.data, name = s.players[actor].name;
      if (a.type === 'draw') { d.hands[actor].push(d.stock.pop()); E.event(s, `${name} берёт кость из базара`, actor, 'draw', { sound: { id: 'draw', target: actor } }); return; }
      if (a.type === 'pass') { d.passes++; E.event(s, `${name}: хода нет`, actor, 'pass', { sound: { id: 'notify' } }); }
      else {
        d.passes = 0;
        const tile = d.hands[actor].splice(d.hands[actor].findIndex(t => t.id === a.card), 1)[0];
        if (d.chain.length) {
          const join = a.side === 'left' ? d.chain[0].a : d.chain[d.chain.length - 1].b;
          if ((a.side === 'left' ? tile.b : tile.a) !== join) [tile.a, tile.b] = [tile.b, tile.a];
        }
        a.side === 'left' ? d.chain.unshift(tile) : d.chain.push(tile);
        E.event(s, `${name} ставит ${tile.a}·${tile.b} ${a.side === 'left' ? 'слева' : 'справа'}`, actor, 'play', { sound: { id: 'move' } });
      }
      s.turn = (actor + 1) % s.players.length;
      if (!d.hands[actor].length) E.finish(s, actor, `${name} выкладывает все кости`, d.hands.reduce((n, h) => n + pips(h), 0));
      else if (d.passes >= s.players.length) {
        const sums = d.hands.map(pips), best = Math.min(...sums), winners = sums.map((v, i) => v === best ? i : -1).filter(i => i >= 0), winner = winners.length === 1 ? winners[0] : null;
        E.finish(s, winner, winner == null ? 'Рыба: ничья по сумме точек' : `Рыба: ${s.players[winner].name} выигрывает с ${best} точками`, winner == null ? 0 : sums.reduce((a, b) => a + b, 0) - best);
      }
    },
    bot(s, actor, actions) { return actions.slice().sort((a, b) => { const ta = s.data.hands[actor].find(t => t.id === a.card), tb = s.data.hands[actor].find(t => t.id === b.card); return (tb ? tb.a + tb.b : 0) - (ta ? ta.a + ta.b : 0); })[0]; }
  });
})(globalThis.TabletopCore);
