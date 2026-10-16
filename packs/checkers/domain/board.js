(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.PlayroomCheckersBoard=api;})(globalThis,function(){
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

 return Object.freeze({captures,moves,positionKey,cellName});
});
