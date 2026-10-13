(function (E) {
  'use strict';
  const dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const cellName = i => `${'abcdefgh'[i % 8]}${8 - Math.floor(i / 8)}`;
  const inside = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  function captures(d, from) {
    const piece = d.board[from], row = Math.floor(from / 8), col = from % 8, out = [];
    if (!piece) return out;
    for (const [dr, dc] of dirs) {
      if (!piece.king) {
        const r = row + dr, c = col + dc, toR = row + 2 * dr, toC = col + 2 * dc, victim = r * 8 + c;
        if (inside(toR, toC) && d.board[victim]?.owner === 1 - piece.owner && !d.captured.includes(victim) && !d.board[toR * 8 + toC]) out.push({ from, to: toR * 8 + toC, victim });
      } else {
        let victim = null;
        for (let r = row + dr, c = col + dc; inside(r, c); r += dr, c += dc) {
          const index = r * 8 + c, occupant = d.board[index];
          if (occupant) {
            if (victim != null || occupant.owner === piece.owner || d.captured.includes(index)) break;
            victim = index;
          } else if (victim != null) out.push({ from, to: index, victim });
        }
      }
    }
    return out;
  }
  function moves(s, actor) {
    const d = s.data, own = d.board.map((p, i) => p?.owner === actor ? i : -1).filter(i => i >= 0);
    const taking = (d.forced == null ? own : [d.forced]).flatMap(from => captures(d, from));
    if (taking.length || d.forced != null) return taking;
    const out = [];
    for (const from of own) {
      const piece = d.board[from], row = Math.floor(from / 8), col = from % 8;
      for (const [dr, dc] of dirs) {
        if (!piece.king && dr !== (actor === (d.lightPlayer??0) ? -1 : 1)) continue;
        for (let r = row + dr, c = col + dc; inside(r, c); r += dr, c += dc) {
          const to = r * 8 + c;
          if (d.board[to]) break;
          out.push({ from, to, victim: null });
          if (!piece.king) break;
        }
      }
    }
    return out;
  }
  function positionKey(s) { return `${s.turn}:` + s.data.board.map(p => p ? `${p.owner}${p.king ? 'K' : 'm'}` : '.').join(''); }
  E.register({
    id: 'checkers', version:'0.3.4', name: 'Шашки', min: 2, max: 2, scoreLabel: 'победы',
    description: 'Обязательные взятия, длинные цепочки и летающие дамки.',
    presets: [{ id: 'classic', label: 'Русские · 12 шашек' }, { id: 'quick', label: 'Мини · 8 шашек' }],
    rules: ['Русские шашки на доске 8×8. Белые начинают. Мини-набор: по 8 шашек.', 'Простые ходят вперёд на одну клетку; бьют вперёд и назад.', 'Взятие обязательно, серию нужно завершить. При выборе не обязательно брать максимум.', 'Дамка ходит и бьёт по всей диагонали. Превращение во время серии действует сразу.', 'Сбитые шашки снимаются в конце серии; через уже сбитую прыгнуть повторно нельзя.', 'Победа: у соперника нет шашек или ходов. Ничья при трёх повторениях позиции или 30 полуходах только дамками без взятий (прототип).'],
    create(s, options = {}) {
      const lightPlayer=options.resolvedFirstPlayer??0;s.turn=lightPlayer;
      const board = Array(64).fill(null), rows = s.preset === 'quick' ? 2 : 3;
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 && (r < rows || r >= 8 - rows)) board[r * 8 + c] = { id: `checker-${r * 8 + c}`, owner: r < rows ? 1-lightPlayer : lightPlayer, king: false };
      s.data = { lightPlayer, board, forced: null, captured: [], quiet: 0, repetitions: {} };
      s.data.repetitions[positionKey(s)] = 1;
    },
    validateState(s) {
      const d = s.data;
      E.assertState(d.lightPlayer===undefined||[0,1].includes(d.lightPlayer),'цвет шашек');
      E.assertState(Array.isArray(d.board) && d.board.length === 64 && Array.isArray(d.captured), 'поле шашек');
      const pieces = d.board.filter(p => p !== null);
      E.assertState(pieces.length <= (s.preset === 'quick' ? 16 : 24) && pieces.every(p => p && typeof p.id === 'string' && /^checker-\d+$/.test(p.id) && [0, 1].includes(p.owner) && typeof p.king === 'boolean'), 'шашки');
      E.assertState(new Set(pieces.map(p => p.id)).size === pieces.length && d.board.every((p, i) => !p || (Math.floor(i / 8) + i % 8) % 2 === 1), 'клетки и ID шашек');
      E.assertState(d.forced === null || (Number.isInteger(d.forced) && d.forced >= 0 && d.forced < 64 && d.board[d.forced]?.owner === s.turn), 'продолжение боя');
      E.assertState(new Set(d.captured).size === d.captured.length && d.captured.every(i => Number.isInteger(i) && i >= 0 && i < 64 && d.board[i]?.owner === 1 - s.turn), 'сбитые шашки');
      E.assertState((d.forced !== null) === (d.captured.length > 0) && (d.forced === null || captures(d, d.forced).length > 0), 'незавершённая серия');
      E.assertState(Number.isInteger(d.quiet) && d.quiet >= 0 && d.quiet <= 30 && d.repetitions && typeof d.repetitions === 'object' && !Array.isArray(d.repetitions) && Object.values(d.repetitions).every(n => Number.isInteger(n) && n >= 1 && n <= 3), 'счётчики ничьей');
    },
    legal(s, actor) { return moves(s, actor).map(m => ({ type: 'move', from: m.from, to: m.to, label: `${cellName(m.from)} ${m.victim == null ? '→' : '×'} ${cellName(m.to)}` })); },
    apply(s, actor, a) {
      const d = s.data, move = moves(s, actor).find(m => m.from === a.from && m.to === a.to), piece = d.board[a.from], wasKing = piece.king;
      d.board[a.to] = piece; d.board[a.from] = null;
      if (Math.floor(a.to / 8) === (actor === (d.lightPlayer??0) ? 0 : 7)) piece.king = true;
      if (move.victim != null) d.captured.push(move.victim);
      const sound = move.victim != null ? { id: 'attack.capture', target: d.board[move.victim].owner }
        : { id: piece.king && !wasKing ? 'notify' : 'move' };
      E.event(s, `${s.players[actor].name}: ${cellName(a.from)} ${move.victim == null ? '→' : '×'} ${cellName(a.to)}${piece.king && !wasKing ? ' — дамка' : ''}`, actor, move.victim == null ? 'move' : 'capture', { sound });
      if (move.victim != null && captures(d, a.to).length) { d.forced = a.to; return; }
      d.quiet = !d.captured.length && wasKing ? d.quiet + 1 : 0;
      for (const victim of d.captured) d.board[victim] = null;
      d.captured = []; d.forced = null; s.turn = 1 - actor;
      if (!moves(s, s.turn).length) { E.finish(s, actor, `${s.players[actor].name} побеждает: у соперника нет ходов`); return; }
      const key = positionKey(s); d.repetitions[key] = (d.repetitions[key] || 0) + 1;
      if (d.repetitions[key] >= 3) E.finish(s, null, 'Ничья: позиция повторилась трижды');
      else if (d.quiet >= 30) E.finish(s, null, 'Ничья: 30 ходов дамками без взятия');
    },
    bot(s, actor, actions) {
      const candidates = actions.map(a => {
        const piece = s.data.board[a.from], row = Math.floor(a.to / 8), col = a.to % 8;
        const promotion = !piece.king && row === (actor === (s.data.lightPlayer??0) ? 0 : 7);
        let risk = 0;
        const trial = E.clone(s.data); trial.board[a.to] = trial.board[a.from]; trial.board[a.from] = null;
        const take = moves(s, actor).find(m => m.from === a.from && m.to === a.to);
        if (take.victim != null) trial.board[take.victim] = null;
        if (promotion) trial.board[a.to].king = true;
        trial.captured = [];
        for (let i = 0; i < 64; i++) if (trial.board[i]?.owner === 1 - actor && captures(trial, i).some(m => m.victim === a.to)) risk = 5;
        return { a, value: (promotion ? 10 : 0) + (take.victim != null ? 4 : 0) - risk + (piece.king ? 0 : (actor === (s.data.lightPlayer??0) ? 7 - row : row) * 0.15) + (col > 1 && col < 6 ? 0.1 : 0) };
      });
      const best = Math.max(...candidates.map(c => c.value));
      const chosen = candidates.filter(c => c.value === best);
      return chosen[s.move % chosen.length].a;
    }
  });
})(globalThis.TabletopCore);
