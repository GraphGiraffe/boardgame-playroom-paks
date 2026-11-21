// Map an authorized solitaire projection to native SDK piles and interactions.
// Each pack supplies its layout kind and message factory. Cards outside the
// viewer's projection never become entities or drag sources.
globalThis.PlayroomSolitairePresentation = function(projection, kind, message) {
  const { data, actions } = projection;
  const completedRuns = kind === 'completed-runs';
  const suits = ['♥', '♣', '♦', '♠'];
  const emptyHomes = data.foundations.flatMap((pile, index) => pile.length ? [] : [index]);
  const missingSuits = suits.filter(suit => !data.foundations.some(pile => pile[0]?.suit === suit));
  const homes = completedRuns ? [] : suits.map(suit => {
    const occupied = data.foundations.findIndex(pile => pile[0]?.suit === suit);
    return { suit, index: occupied >= 0 ? occupied : emptyHomes[missingSuits.indexOf(suit)] };
  });
  const visiblePiles = [...data.tableau.flat(), ...data.waste, ...data.foundations.flat()];
  const suggested = data.hints.map(hint => actions.find(action =>
    Object.entries(hint).every(([key, value]) => action[key] === value))).filter(Boolean);
  const hints = suggested.filter(action => {
    if (action.type === 'flip') return true;
    if (action.type !== 'move' || action.source === 'foundation') return false;
    if (action.target !== 'foundation') return true;
    const suit = visiblePiles.find(card => card.id === action.card)?.suit;
    return homes.find(home => home.suit === suit)?.index === action.to;
  }).concat(suggested.filter(action => ['draw', 'recycle'].includes(action.type)));
  const keys = ['actions.undo','actions.draw','actions.recycle','ui.stock','ui.waste','ui.foundation',
    'ui.empty','ui.score','ui.moves','ui.series','ui.hint','ui.noHint','ui.rank11','ui.rank12',
    'ui.rank13','ui.rank14',completedRuns ? 'ui.orientation' : 'ui.autoCollectHelp'];
  const numbered = (name, stacks) => stacks.map((cards, index) => [name + '-' + index, cards]);
  const piles = [['stock', data.stock], ['waste', data.waste], ...numbered('tableau', data.tableau),
    ...numbered('foundation', data.foundations), ...numbered('completed', data.completed)];
  const ref = id => ({ namespace: 'card', id: String(id) });
  function interaction(command) {
    let zone = 'field';
    if (command.type === 'move') zone = command.target + '-' + command.to;
    if (command.type === 'draw' || command.type === 'recycle') zone = 'stock';
    if (command.type === 'flip') zone = 'tableau-' + command.from;
    return { command, kind: command.type === 'move' ? 'move' : 'activate',
      ...(command.card != null ? { source: { entity: ref(command.card) }, activation: 'select',
        gestures: { drag: true, swipe: false } } : {}), target: { zone } };
  }
  return {
    contractVersion: 1, family: 'solitaire', screenFamily: 'cards', hidePlayers: true,
    actionPlacement: 'header-landscape', fieldSizing: 'scroll', actionReserve: true,
    players: [{ player: 0, metrics: data.config.scoring !== 'none' && data.score >= 0
      ? [{ id: 'score', kind: 'points', value: data.score, label: message('meta.score'), resultUsage: true }] : [] }],
    solitaireLayout: { kind, homes, hints, labels: Object.fromEntries(keys.map(key => [key, message(key)])),
      transfers: (projection.events || []).findLast(event => event.type.endsWith('.collect'))?.params?.transfers || [] },
    tableau: data.tableau, waste: data.waste, foundations: data.foundations, completed: data.completed,
    stockCount: data.stock.length, drawCapacity: data.config.draw, scoring: data.config.scoring,
    score: data.score, moves: data.moves, hints: data.hints, dragSources: data.dragSources,
    blockedDraw: completedRuns && !actions.some(action => action.type === 'draw') && data.stock.length > 0
      && !data.config.emptyDeal && data.tableau.some(column => !column.length),
    geometry: { topology: 'fixed' },
    zones: [{ id: 'field', kind: 'table' }, ...piles.map(([id, cards]) => ({ id, kind: 'pile', count: cards.length }))],
    objects: piles.flatMap(([zone, cards]) => cards.flatMap((card, index) =>
      card && !card.hidden && card.open && card.id != null ? [{ ref: ref(card.id), zone, index }] : [])),
    interactions: actions.map(interaction)
  };
};
