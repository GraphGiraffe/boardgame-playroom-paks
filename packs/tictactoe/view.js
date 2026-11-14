// Web renderer: it receives an authorized projection and serializable scene.
(function (root) {
  'use strict';
  const source = typeof require === 'function' && !root.PlayroomPack;
  const P = source ? require('./presentation/scene.js') : root.PlayroomPackPresentation;
  const V = root.PlayroomViews, H = V.helpers, C = root.PlayroomShared;
  const locales = source ? {ru:require('./locales/ru/game.json')} : root.PlayroomPackResources.locales;
  const translator = H.translator(locales), text = reference => H.esc(translator.format(reference));
  const mark = value => value === null ? '' : C.roundTokenArt()
    .replace('class="round-token-art', 'style="display:block;width:84%;height:84%;--round-token-fill:var(--color-material-card-face,#fff9e6)" class="ttt-token-art round-token-art')
    .replace('</svg>', `<g fill="none" stroke="currentColor" stroke-width="9" stroke-linecap="round">${value === 'X' ? '<path d="M30 25 70 65M70 25 30 65"/>' : '<circle cx="50" cy="45" r="24"/>'}</g></svg>`);
  function render(state, viewer, actions) {
    const scene = state.scene;
    const available = cell => cell.command && actions.find(action =>
      action.type === cell.command.type && action.cell === cell.index);
    return {api:3, family:scene.family, className:'tictactoe-scene', fieldAspect:1,
      playerContent:H.playerContent(state, viewer, null, {scoreLabel:translator.format(P.metadata.scoreLabel),badges:player => [{label:scene.players[player].mark}]}),
      elements:{field:`<div class="ttt-grid" role="grid" aria-label="${text(scene.label)}">${scene.cells.map(cell =>
        `<button data-interaction-shape="cell" class="ttt-cell ${cell.mark === 'X' ? 'cross' : cell.mark === 'O' ? 'nought' : ''}" role="gridcell" ${available(cell) ? H.actionAttr(available(cell)) : 'disabled'} aria-label="${text(cell.label)}"><span data-motion-effect="pulse" data-motion-trigger="place" data-motion-key="cell" data-motion-value="${cell.index}">${mark(cell.mark)}</span></button>`).join('')}</div>`}};
  }
  const cover = () => C.cover('<g transform="translate(76 16) rotate(-7 74 74)"><rect x="2" y="6" width="148" height="148" rx="16" fill="#bcab83"/><rect width="148" height="148" rx="16" fill="#fff9e6"/><path d="M49 9v130M98 9v130M9 49h130M9 98h130" stroke="#c9bb93" stroke-width="3"/><path d="m15 14 21 22m0-22L15 36m99 80 21 22m0-22-21 22" stroke="#c8775c" stroke-width="7" stroke-linecap="round"/><circle cx="74" cy="74" r="16" fill="none" stroke="#4e7966" stroke-width="7"/></g>');
  V.register('tictactoe', render, cover, {illustrations:(source?require('./presentation/rule-illustrations.js'):globalThis.PlayroomPackRuleIllustrations).create({mark}),surfaces:{table:render, player:render}});
})(globalThis);

(function(root){
 const source=typeof require==='function'&&!root.PlayroomPack;
 const tutorial=source?require('./presentation/tutorial.js'):root.PlayroomPackTutorial;
 const tr=root.PlayroomViews.helpers.translator(source?{ru:require('./locales/ru/game.json')}:root.PlayroomPackResources.locales);
 root.PlayroomViews.registerTutorial?.("tictactoe",tutorial(tr));
})(globalThis);
