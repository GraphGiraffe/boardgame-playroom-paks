(function (E) {
  'use strict';
  const face = card => `${({ 11: 'В', 12: 'Д', 13: 'К', 14: 'Т' })[card.rank] || card.rank}${card.suit}`;
  const beats = (card, attack, trump) => card.suit === attack.suit ? card.rank > attack.rank : card.suit === trump && attack.suit !== trump;
  function endBout(s) {
    const d = s.data, oldAttacker = d.attacker, oldDefender = d.defender;
    const cards = d.table.flatMap(pair => pair.defense ? [pair.attack, pair.defense] : [pair.attack]);
    if (d.taking) {
      d.hands[oldDefender].push(...cards);
      E.event(s, `${s.players[oldDefender].name} забирает ${cards.length} карт`, oldDefender, 'take', { sound: { id: 'draw', target: oldDefender } });
    } else {
      d.discard.push(...cards);
      E.event(s, 'Бито', oldDefender, 'discard', { sound: { id: 'defend' } });
      [d.attacker, d.defender] = [oldDefender, oldAttacker];
    }
    for (const player of [oldAttacker, oldDefender]) while (d.hands[player].length < d.handSize && d.drawPile.length) d.hands[player].push(d.drawPile.pop());
    d.table = []; d.taking = false; s.turn = d.attacker;
    d.attackLimit = Math.min(d.handSize, d.hands[d.defender].length);
    if (!d.drawPile.length) {
      const empty = d.hands.map((h, i) => h.length ? -1 : i).filter(i => i >= 0);
      if (empty.length === 2) E.finish(s, null, 'Ничья: оба игрока вышли');
      else if (empty.length === 1) E.finish(s, empty[0], `${s.players[empty[0]].name} выходит; ${s.players[1 - empty[0]].name} остаётся с картами`);
    }
  }
  E.register({
    id: 'durak', version: '0.2.0', name: 'Дурак', min: 2, max: 2, scoreLabel: 'победы',
    description: 'Подкидывайте, отбивайтесь и берегите козыри.',
    presets: [{ id: 'classic', label: 'Классика · по 6 карт' }, { id: 'quick', label: 'Малая рука · по 5 карт' }],
    rules: ['Подкидной дурак на двоих, 36 карт. Младший козырь начинает.', 'Побейте старшей картой той же масти или козырем. Козырь бьёт только старший козырь.', 'Подкидывать можно значения, уже лежащие на столе. Заходы чередуются с защитой.', 'Не больше размера стартовой руки защитника и не больше 6 (5 в малом наборе) атак за заход.', 'После «Беру» атакующий может подкинуть ещё или завершить. После защиты — «Бито».', 'Добор сначала атакующему, затем защитнику. Побеждает вышедший после окончания колоды и захода.'],
    create(s) {
      let deck = [];
      for (const suit of ['♠', '♥', '♦', '♣']) for (let rank = 6; rank <= 14; rank++) deck.push({ id: `${suit}${rank}`, suit, rank });
      deck = E.shuffle(deck, s);
      const hands = [[], []], handSize = s.preset === 'quick' ? 5 : 6;
      for (let n = 0; n < handSize; n++) for (const hand of hands) hand.push(deck.pop());
      const trump = { ...deck[0] };
      let lowest = 15, attacker = 0;
      hands.forEach((hand, p) => hand.forEach(c => { if (c.suit === trump.suit && c.rank < lowest) { lowest = c.rank; attacker = p; } }));
      s.turn = attacker;
      s.data = { hands, drawPile: deck, trump, table: [], attacker, defender: 1 - attacker, discard: [], taking: false, handSize, attackLimit: handSize };
    },
    validateState(s) {
      const d = s.data, validCard = c => c && ['♠', '♥', '♦', '♣'].includes(c.suit) && Number.isInteger(c.rank) && c.rank >= 6 && c.rank <= 14 && c.id === `${c.suit}${c.rank}`;
      E.assertState(Array.isArray(d.hands) && d.hands.length === 2 && Array.isArray(d.table), 'руки и стол дурака');
      E.assertState(d.table.every(p => p && validCard(p.attack) && (p.defense === null || validCard(p.defense))), 'пары на столе');
      E.validateComponents([...d.hands, d.drawPile, d.discard, d.table.flatMap(p => p.defense ? [p.attack, p.defense] : [p.attack])], validCard, 36);
      E.assertState(validCard(d.trump) && (!d.drawPile.length || d.drawPile[0].id === d.trump.id), 'козырь');
      E.assertState([0, 1].includes(d.attacker) && d.defender === 1 - d.attacker && typeof d.taking === 'boolean', 'роли дурака');
      E.assertState(d.handSize === (s.preset === 'quick' ? 5 : 6) && Number.isInteger(d.attackLimit) && d.attackLimit >= 0 && d.attackLimit <= d.handSize && d.table.length <= d.attackLimit, 'лимит подкидывания');
      E.assertState(d.table.every(p => !p.defense || beats(p.defense, p.attack, d.trump.suit)), 'неверная защита');
      E.assertState(s.turn === (d.taking || d.table.every(p => p.defense) ? d.attacker : d.defender), 'очерёдность дурака');
    },
    legal(s, actor) {
      const d = s.data, actions = [];
      if (actor === d.attacker) {
        const ranks = new Set(d.table.flatMap(p => p.defense ? [p.attack.rank, p.defense.rank] : [p.attack.rank]));
        if (d.table.length < d.attackLimit) for (const card of d.hands[actor]) if (!d.table.length || ranks.has(card.rank)) actions.push({ type: 'attack', card: card.id, label: `Подкинуть ${face(card)}` });
        if (d.table.length && (d.taking || d.table.every(p => p.defense))) actions.push({ type: 'done', label: d.taking ? 'Закончить подкидывать' : 'Бито' });
      } else {
        d.table.forEach((pair, target) => { if (!pair.defense) for (const card of d.hands[actor]) if (beats(card, pair.attack, d.trump.suit)) actions.push({ type: 'defend', card: card.id, target, label: `${face(card)} бьёт ${face(pair.attack)}` }); });
        if (d.table.some(p => !p.defense)) actions.push({ type: 'take', label: 'Беру' });
      }
      return actions;
    },
    apply(s, actor, a) {
      const d = s.data, name = s.players[actor].name;
      if (a.type === 'done') { endBout(s); return; }
      if (a.type === 'take') { d.taking = true; s.turn = d.attacker; E.event(s, `${name}: беру`, actor, 'take', { sound: { id: 'notify' } }); return; }
      const card = d.hands[actor].splice(d.hands[actor].findIndex(c => c.id === a.card), 1)[0];
      if (a.type === 'attack') {
        d.table.push({ attack: card, defense: null });
        E.event(s, `${name} атакует: ${face(card)}`, actor, 'attack', { sound: { id: 'attack', target: d.defender } });
        s.turn = d.taking ? d.attacker : d.defender;
      } else {
        d.table[a.target].defense = card;
        E.event(s, `${name}: ${face(card)} бьёт ${face(d.table[a.target].attack)}`, actor, 'defend', { sound: { id: 'defend' } });
        s.turn = d.table.every(p => p.defense) ? d.attacker : d.defender;
      }
    },
    bot(s, actor, actions) {
      const d = s.data, cards = actions.filter(a => a.card);
      if (!cards.length) return actions[0];
      return cards.sort((a, b) => {
        const ca = d.hands[actor].find(c => c.id === a.card), cb = d.hands[actor].find(c => c.id === b.card);
        return (ca.rank + (ca.suit === d.trump.suit ? 20 : 0)) - (cb.rank + (cb.suit === d.trump.suit ? 20 : 0));
      })[0];
    }
  });
})(globalThis.TabletopCore);
