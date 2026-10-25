// Serializable presentation model. Rendering, translation and input stay outside.
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.PlayroomPackPresentation = api;
})(globalThis, function () {
  'use strict';
  const message = (key, params = {}) => ({key:'tictactoe.' + key, params});
  const metadata = Object.freeze({name:message('meta.name'), description:message('meta.description'),
    scoreLabel:message('meta.score-label'), presets:[{id:'classic', label:message('meta.classic')}],
    rules:Array.from({length:3},(_,i)=>message('rules.'+(i+1)))});
  function action(command) { return message('actions.place', {cell:command.cell + 1}); }
  function event(value) {
    switch (value.type) {
      case 'tictactoe.placed': return {message:message('events.placed', {mark:value.params.mark, cell:value.params.cell + 1}),
        kind:'move', presentation:{type:'place', cell:value.params.cell}};
      case 'tictactoe.won': return {message:message('events.won'), finish:true};
      case 'tictactoe.draw': return {message:message('events.draw'), finish:true};
      default: { const error = new Error('TICTACTOE_EVENT_UNKNOWN'); error.code = error.message; throw error; }
    }
  }
  function metric(id) {
    if (id !== 'wins') { const error = new Error('TICTACTOE_METRIC_UNKNOWN'); error.code = error.message; throw error; }
    return message('meta.score-label');
  }
  function scene(projection) {
    const commands = new Map(projection.actions.map(command => [command.cell, command]));
    return {contractVersion:1, family:'board', id:'tictactoe-board', columns:3, rows:3, label:message('board.label'),
      players:projection.data.marks.map((mark, player) => ({player, mark,
        metrics:[{id:'wins', kind:'wins', value:projection.winners.includes(player) ? 1 : 0,
          format:'integer', label:metric('wins'), placement:'wins', resultUsage:true}]})),
      cells:projection.data.board.map((owner, cell) => ({id:'cell-' + cell, index:cell,
        owner, mark:owner === null ? null : projection.data.marks[owner], command:commands.get(cell) || null,
        label:owner === null ? message('board.empty-cell', {cell:cell + 1})
          : message('board.marked-cell', {cell:cell + 1, mark:projection.data.marks[owner]})}))};
  }

 // Geometry contains only public identities from the authorized projection.
 function sceneLayout(p){const d=p.data;return {geometry:{topology:'fixed'},zones:[{id:'field',kind:'board'}],objects:d.board.flatMap((owner,cell)=>owner===null?[]:[{ref:{namespace:'mark',id:String(cell)},zone:'field',cell,owner}]),interactions:p.actions.map(command=>({command,target:{zone:'field'}}))};}
 return Object.freeze({metadata:Object.freeze({...metadata,presets:metadata.presets.map(preset=>({...preset,description:message('modes.'+preset.id)}))}), action, event, metric, scene:p=>({...scene(p),...sceneLayout(p)})});
});
