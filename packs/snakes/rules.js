(function (E) {
  'use strict';
  E.register({
    id: 'snakes', version: '0.3.3', name: 'Змеи и лестницы', min: 2, max: 4, scoreLabel: 'победы',
    description: 'Один бросок — и всё меняется. Дорога к вершине в вашем кармане.',
    presets: [{ id: 'classic', label: 'Классика · 100 клеток' }, { id: 'quick', label: 'Быстро · 64 клетки' }],
    rules: ['Бросайте d6 и двигайтесь к финишу. Шестёрка не даёт дополнительного хода.', 'Лестница поднимает, змея опускает. Срабатывает один переход за ход.', 'До финиша нужно дойти точно: лишние шаги отскакивают назад.', 'Быстрый набор использует поле 8×8, классический — 10×10.'],
    create(s, options = {}) {
      if(options.resolvedFirstPlayer!=null)s.turn=options.resolvedFirstPlayer;
      const quick = s.preset === 'quick';
      s.data = { positions: s.players.map(() => 0), dice: null, sides: 6, finish: quick ? 64 : 100, links: quick ? { 3: 15, 8: 26, 20: 34, 31: 49, 43: 58, 22: 7, 39: 18, 52: 36, 61: 45 } : { 3: 22, 8: 30, 20: 41, 28: 55, 50: 67, 71: 92, 17: 4, 39: 19, 54: 31, 62: 43, 87: 64, 96: 75 } };
    },
    validateState(s) {
      const d = s.data, position = p => Number.isInteger(p) && p >= 0 && p <= d.finish;
      E.assertState(d.finish === (s.preset === 'quick' ? 64 : 100) && d.sides === 6 && (d.dice === null || (Number.isInteger(d.dice) && d.dice >= 1 && d.dice <= d.sides)), 'кубик и финиш');
      E.assertState(Array.isArray(d.positions) && d.positions.length === s.players.length && d.positions.every(position), 'позиции фишек');
      E.assertState(d.links && typeof d.links === 'object' && !Array.isArray(d.links) && Object.entries(d.links).every(([from, to]) => /^\d+$/.test(from) && position(Number(from)) && Number(from) > 0 && Number(from) < d.finish && position(to) && to > 0 && to !== Number(from)), 'змеи и лестницы');
      if (d.lastMove != null) E.assertState(Number.isInteger(d.lastMove.player) && d.lastMove.player >= 0 && d.lastMove.player < s.players.length && [d.lastMove.from, d.lastMove.landing, d.lastMove.to].every(position) && d.lastMove.roll === d.dice, 'последний бросок');
    },
    legal() { return [{ type: 'roll', label: 'Бросить кубик' }]; },
    apply(s, actor) {
      const d = s.data, roll = E.rollDie(d.sides, s), from = d.positions[actor];
      let to = from + roll;
      if (to > d.finish) to = d.finish - (to - d.finish);
      d.dice = roll; d.lastMove = { player: actor, from, landing: to, to: d.links[to] || to, roll };
      const jump = d.links[to]; d.positions[actor] = jump || to;
      E.event(s, `${s.players[actor].name}: ${roll} → ${to}${jump ? ` → ${jump} (${jump > to ? 'лестница' : 'змея'})` : ''}`, actor, 'roll', { sound: { id: jump ? (jump > to ? 'climb' : 'fall') : 'dice' } });
      s.turn = (actor + 1) % s.players.length;
      if (d.positions[actor] === d.finish) E.finish(s, actor, `${s.players[actor].name} достигает финиша!`);
    }
  });
})(globalThis.TabletopCore);
