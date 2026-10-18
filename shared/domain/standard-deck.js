// Pure domain data. No engine, UI, storage, clock or localization dependency.
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PlayroomPackDomain ||= {};
  root.PlayroomPackDomain.standardDeck = api;
})(globalThis, function () {
  'use strict';
  const SUITS = Object.freeze(['♠', '♥', '♦', '♣']);

  function create(size, { exclude = [] } = {}) {
    if (![36, 52, 54].includes(size)) throw new RangeError('DECK_SIZE_UNSUPPORTED');
    if (!Array.isArray(exclude) || exclude.some(id => typeof id !== 'string')) {
      throw new TypeError('DECK_EXCLUSIONS_INVALID');
    }
    const cards = [];
    for (let rank = size === 36 ? 6 : 2; rank <= 14; rank++) {
      for (const suit of SUITS) cards.push({ id: `${suit}${rank}`, suit, rank });
    }
    if (size === 54) {
      for (const color of ['red', 'black']) {
        cards.push({ id: `joker-${color}`, suit: '★', rank: 15, joker: true, color });
      }
    }
    const known = new Set(cards.map(card => card.id));
    if (new Set(exclude).size !== exclude.length || exclude.some(id => !known.has(id))) {
      throw new RangeError('DECK_EXCLUSION_UNKNOWN');
    }
    const omitted = new Set(exclude);
    return cards.filter(card => !omitted.has(card.id));
  }

  return Object.freeze({ create, suits: SUITS });
});
