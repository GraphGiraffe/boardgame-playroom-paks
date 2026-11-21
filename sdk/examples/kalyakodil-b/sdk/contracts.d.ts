/** Studio contract v1. Player application integration is a separate boundary. */
export type JSONValue = null | boolean | number | string | JSONValue[] | {[key:string]:JSONValue};
export type Command = {type:string; [key:string]:JSONValue};
export interface Timeline {turn:number;starts:number[];round?:number;roundStarts?:number[];preparing?:boolean;playStart?:number}
export interface Position {playerCount:number; turn:number; status:'playing'|'finished'; winners:number[]; data:{[key:string]:JSONValue}; rng?:number; revision?:number; clock?:number;preset?:string;timeline?:Timeline}
export interface Projection {contractVersion:1; game:string; viewer:number; actor:number; audience:'public'|'player'; playerCount:number; turn:number; status:'playing'|'finished'; winners:number[]; data:{[key:string]:JSONValue}; actions:Command[]; inputs?:InputChoice[]; events:JSONValue[];choicesVersion?:1;preset?:string;timeline?:Timeline;decisionWindow?:DecisionWindow|null}
export type Element='air'|'earth'|'water'|'fire';
export type ArenaTile='ground'|'base'|'wall'|'spikes'|'falling_floor'|'puddle'|'desert'|'air_island'|'forest';
/** Public presentation data only; previews and plans are supplied by rules. */
export interface ElementalArenaLayout {kind:'elemental-grid';labels:{[key:string]:Message|string}}
export interface ElementalArenaPlayer {pos:[number,number]|null;health:number;lives:number;team:number;ultimate:number;maxHand:number;kills:number;handCount:number;healthMetric:Metric;metrics:Metric[];hand?:{id:string;element:Element}[];plan?:JSONValue;draft?:JSONValue}
export interface ElementalArenaState {size:number;board:(ArenaTile|null)[];inset:number;phase:string;players:ElementalArenaPlayer[];config:{[key:string]:JSONValue};previews?:{command:Command;cells:[number,number][];origin?:[number,number]}[];startingBases?:[number,number][];teamLives?:number[];shrink?:boolean;shrinkCounter?:{filled:number;capacity:number;scheduled:boolean};window?:DecisionWindow;loot?:{player:number;victim:number;count:number}}

export interface EntityRef {namespace:string;id:string}
export interface Die {value:number|null;held?:boolean;used?:boolean;rollable?:boolean;lastRolled?:boolean;motion?:'roll';label?:Message|string}
export interface StandardCard {id:string;rank:number;suit:string;joker?:boolean;color?:'red'|'black';rankLabel?:Message|string|number;crown?:boolean;label:Message|string;help:Message|string}
export type SolitaireCard={hidden:true}|{id:string;rank:number;suit:'♥'|'♣'|'♦'|'♠';open:true};
export interface CheckerPiece {id:string;owner:number;cell:number;side:0|1;king:boolean;captured:boolean}
export interface ScoreCell {player:number;value:number|null;preview:number;label:Message|string;command?:Command|null}
export interface ScoreRow {id:string;label:Message|string;cells:ScoreCell[]}
export interface RoutePawn {id:string;owner:number;pawn:number;progress:number;kind:'base'|'track'|'finish';point:[number,number];anchor:string;label:Message|string;friendly:boolean;command?:Command}
export interface RouteMove {command:Command;from:number;to:number;capture:boolean;targetKind:'move'|'home'|'capture';anchor:string;route:string[]}
export interface Message {key:string; params?:{[key:string]:JSONValue | Message}}
export interface Choice {command:Command; visibility:'public'|'private'}
export type Metric={id:string;kind:'points'|'wins'|'pieces';value:number;label:string|Message;resultUsage?:boolean;display?:{icon:'heart'|'meeple'|'crown';capacity?:number;overlap?:boolean}};
export type InputField={kind:'text';maxLength:number;minLength?:number;label?:string}|{kind:'integer';min:number;max:number;label?:string}|{kind:'boolean';label?:string}|{kind:'enum';values:Array<string|number|boolean>;label?:string}|{kind:'ink';label?:string};
export interface InputChoice extends Choice {fields:{[key:string]:InputField};label?:string}
export type InkOperation={kind:'stroke';id:string;tool:'brush'|'eraser';color:string;width:1|2|3;points:number[][]}|{kind:'fill';id:string;color:string;x:number;y:number}|{kind:'clear';id:string};
export interface EventDraft {type:string;actor:number|null;params:{[key:string]:JSONValue};visibility:{kind:'public'}|{kind:'players';players:number[]};publicEvent?:EventDraft}
export interface Result {winners:number[];places:number[];metrics:{id:string;values:number[];order?:'asc'|'desc'}[];playerOrder?:number[];lastPlayers?:number[];exits?:{player:number;kind:'cards'|'domino'|'finished';turn?:number;round?:number}[]}
export interface BotSettings {difficulty?:'easy'|'medium'|'hard';enabled?:boolean;strategy?:string;resolvedStrategy?:string}
export interface BotContext {difficulty:'easy'|'medium'|'hard';errorRate:number;depth:number;random():number;[key:string]:unknown}
export interface DecisionWindow {id:string;participants:number[];ready:number[];versions:{[player:string]:number}}
export interface ReactionControl {kind:'answer'|'challenge'|'advance'|'independent';ignore?:boolean;independent?:boolean;episode?:number;command?:Command}
export interface ReactionWindow {id:string;owner:number;revision:number;humanMs:number;botMs:number;fallbackMs:number}
export type Facts=Omit<Projection,'actions'|'inputs'>;
export interface DraftSpec {mode:'sequence'|'coalesce';select:string[];commit:string[];count?:number;max?:number;delayMs?:number;toggleKey?:string;cancel?:string}
/** roundEnded:true requires Definition.rounds:true and turnEnded:true. */
export interface Transition {position:Position;events:EventDraft[];turnEnded?:boolean;roundEnded?:boolean}
export interface Definition {
 contractVersion:1; id:string; minPlayers:number; maxPlayers:number;
 rounds?:boolean;
 create(options:{playerCount:number;firstPlayer:number;rng:number;[key:string]:JSONValue}):Position | {position:Position;events:EventDraft[]};
 validate(position:Position):boolean;
 actions(position:Position,actor:number):Choice[];
 reduce(position:Position,actor:number,command:Command,context:{now:number}):Transition;
 inputs?(position:Position,actor:number):InputChoice[];
 clockActions?(position:Position):Command[];
 advance?(position:Position,now:number,control?:Command):Transition|null;
 project(position:Position,viewer:number):{[key:string]:JSONValue};
 result(position:Position):Result;
 /** Public score only. Hidden penalties must remain masked until revealed. */
 score?(position:Position):number[];
 observe?(position:Position,actor:number):{[key:string]:JSONValue};
 botContext?(position:Position,actor:number):{[key:string]:JSONValue};
 bot?(projection:Projection,actor:number,choices:Command[],memory:{[key:string]:JSONValue},context:BotContext):Command|null;
 botHandlesDifficulty?:boolean;
 botMistakes?(projection:Projection,actor:number,choices:Command[]):Command[];
 reactions?(position:Position,actor:number):Choice[];
 reactionControl?(position:Position,actor:number,command:Command):ReactionControl|null;
 reactionWindows?(position:Position):ReactionWindow[];
 botReaction?(projection:Projection,actor:number,choices:Command[],memory:{[key:string]:JSONValue},settings:BotSettings|null):Command|null;
 botReactionDelay?(projection:Projection,actor:number,settings:BotSettings|null,memory:{[key:string]:JSONValue}):number|null;
 decisionWindow?(position:Position):DecisionWindow|null;
 preparing?(position:Position):boolean;
 turnOrder?(projection:Projection):{next:number|null}|{players:number[];direction?:1|-1}|null;
 derivedFields?:{[commandType:string]:string[]};
 localChoices?(facts:Facts):Choice[];
 localData?(facts:Facts):{[key:string]:JSONValue};
 localReaction?(projection:Projection,command:Command):ReactionControl|null;
 draft?(projection:Projection):DraftSpec|null;
 draftProjection?(projection:Projection,commands:Command[]):Projection;
 storageState?(data:{[key:string]:JSONValue}):{[key:string]:JSONValue};
 checkpoint?(before:{[key:string]:JSONValue},after:{[key:string]:JSONValue},actor:number,command:Command):boolean;
}
export interface Scene {
 contractVersion:1; id:string; family:string;
 /** Shared print component; rules never select a renderer by game ID. */
 deck?:'standard'|'color-value'|'domino';
 screenFamily?:'board'|'cards';
 fieldSizing?:'fit'|'content'|'scroll';
 actionPlacement?:'header-landscape';fieldDropZone?:boolean;actionReserve?:boolean;showTurn?:boolean;hidePlayers?:boolean;
 layout?:{focus?:'hands'|'field'|'balanced';seats?:('north'|'north-west'|'north-east'|'west'|'east'|'south-west'|'south-east'|'south')[];duplicateSelf?:boolean;wideHand?:boolean;overrides?:{fieldColumns?:3;opponentsAlign?:'start'|'end';playerIndicators?:'below-avatar';mirrorIndicators?:boolean}};
 fieldAspect?:number;
 /** Ruled grid, player mark badges and a placement pulse for `{type:'place',cell}`. */
 cellStyle?:'mark-token';
 handLayout?:'row'|'fan'|'overlap'|'tiles';
 /** Host layout slot and physical die profile; neither changes game rules. */
 dicePlacement?:'field'|'actions'|'status';diceStyle?:'flat'|'raised';
 /** Public board geometry. Legal moves and route previews come from the pack. */
 routeStyle?:'cross-and-circle'|'numbered-serpentine';boardSides?:('green'|'red'|'blue'|'yellow')[];
 pawns?:RoutePawn[];
 /** Route profiles expose legal moves; solitaire exposes its numeric move count. */
 moves?:number|(RouteMove|{command:Command;landing:number;route:number[]})[];
 numberedRoute?:{label:Message|string;entrySlots:number;source:{entity:EntityRef}|null;cells:{cell:number;label:Message|string;special?:{id:string;icon:'adjustDie'|'lessDie'|'skipTurn'|'shield'|'secondDie'|'extraTurn';color:string}}[];links:{from:number;to:number;kind:'ladder'|'snake'}[];adjustment:{parameter:string;label:Message|string;active:boolean;options:{value:number;label:Message|string}[]};swapSummary:Message|string;swapLabel:(Message|string)[]};
 positions?:{id:string;player:number;cell:number;point:{x:number;y:number};value:number;label:Message|string;swapRole:''|'arrived'|'displaced'}[];
 routeCells?:{id:string;point:[number,number];kind:'path'|'home'|'finish';label:Message|string;side?:number;symbol?:'arrow'|'star';rotation?:number}[];
 /** Authored category rows and precomputed summaries; the host owns display identities. */
 arenaLayout?:ElementalArenaLayout;arena?:ElementalArenaState; solitaireLayout?:{kind:'waste-foundations'|'completed-runs';homes:{suit:string;index:number}[];hints:Command[];labels:{[key:string]:Message|string};transfers:{card:SolitaireCard;from:string;to:string}[]};
 tableau?:SolitaireCard[][];waste?:SolitaireCard[];foundations?:SolitaireCard[][];completed?:SolitaireCard[][];drawCapacity?:1|3;dragSources?:string[];scoring?:'standard'|'none'|'vegas';score?:number;blockedDraw?:boolean;
 memoryLayout?:{kind:'paired-grid';label:Message|string};skinFamilies?:string[];assetSet?:'cartoon-deck'|'standard-deck';revealing?:boolean;selectionCount?:number;
 cards?:{id:string;index:number;card:{hidden:true}|{id:string;rank?:number;suit?:string;joker?:boolean;character?:string;shape?:string;color?:string};label?:Message|string;matched:boolean;closing:boolean}[];
 forced?:number|null;lightPlayer?:number;pieces?:CheckerPiece[];
 fleetLayout?:{kind:'naval';base:number;setupPlayer:number|null;preferredPlayer:number;orientation:boolean;boards:{player:number;label:Message|string;indicators:{id:string;icon:'ship';value:number;size:number;label:Message|string;complete?:boolean}[];ships:{ref:EntityRef;cells:number[];vertical:boolean;label:Message|string;remove?:Command;rotate?:Command}[];cells:{cell:number;shot:'hit'|'miss'|null;label:Message|string}[]}[];placements:{command:Command;source:{entity:EntityRef}|{zone:string;cell?:number;index?:number};cell:number;vertical:boolean;preserveSelection:boolean}[];controls:{auto:{label:Message|string;command?:Command};ready:{label:Message|string;command?:Command};orient:{label:Message|string;command?:Command};rotateLabel:Message|string;removeLabel:Message|string;followLabel:Message|string;ownLabel:Message|string;enemyLabel:Message|string}};
 checkerLayout?:{kind:'draughts';label:Message|string;flipped:boolean;cells:{cell:number;file:string;rank:string;label:Message|string;help:Message|string}[];moves:{command:Command;source:EntityRef;from:number;to:number;capture:boolean;kingMove:boolean;label:Message|string;help:Message|string}[]};
 scoreLayout?:{kind:'category-sheet';categoryLabel:Message|string;summaries:{id:string;afterRow:string;label:Message|string;values:number[]}[];total:{id:string;label:Message|string;values:number[]};controls:{public:boolean;label:Message|string;command?:Command}};
 statusItems?:{label:Message|string;value:number}[];
 chain?:{id:string;a:number;b:number;label?:Message|string;help?:Message|string}[];
 openingTileId?:string|null;
 chainPresentation?:{label:Message|string;edge:Message|string};
 placements?:{command:Command;a:number;b:number;join:number|null;label:Message|string;caption:Message|string;help:Message|string}[];
 /** Localized label for the host-owned help for visible cards. */
 cardHelp?:Message|string;
 nextPlayer?:number|null;
 /** Predictions for named legal card sources in the current viewer's scene. */
 nextPlayerByCard?:Record<string,number|null>;
 turnPreviewByCard?:Record<string,{nextPlayer:number|null;affected:number[];kind:string;label?:Message|string}>;
 actionDock?:Partial<Record<'start'|'primary'|'end',{label:Message|string;command?:Command}[]>>;
 /** Public physical cards; empty pair footprints are owned by the host renderer. */
 table?:{attack:StandardCard;defense:StandardCard|null}[];trump?:StandardCard|null;stockCount?:number;discardCount?:number;
 handInspection?:boolean;
 playerChoices?:{kind:'request'|'cards';cardShape?:'portrait'|'square';choices:{player:number;command:Command;label:Message|string;source?:EntityRef;index?:number}[]};
 tableLayout?:{kind:'collected-sets';stockLabel:Message|string;rows:{player:number;label:Message|string;cards:{id:string;rank:number}[]}[]}|{kind:'discard-pairs';discardLabel:Message|string}|{kind:'paired-tricks';capacity:number;stockLabel:Message|string;discardLabel:Message|string;uncoveredLabel:Message|string;trumpLabel:Message|string}|{kind:'stock-discard';stockLabel:Message|string;stockHelp:Message|string;stockCountLabel:Message|string;discardLabel:Message|string;discardHelp:Message|string;dropLabel:Message|string;dropActionLabel:Message|string;dropChoiceLabel:Message|string;flow?:{color:'red'|'yellow'|'green'|'blue'|'wild'|'black';label:Message|string;description?:Message|string;direction?:1|-1;directionLabel?:Message|string}};
 players:({player:number;metrics:Metric[];mark?:string}&{[key:string]:unknown})[];
 cells?:JSONValue[]; rows?:number|JSONValue[]|ScoreRow[]; columns?:number; dice?:(number|null|Die)[];
 geometry?:JSONValue; zones?:JSONValue[]; objects?:JSONValue[]; interactions?:{command:Command;kind?:'move'|'select'|'activate';source?:{entity:EntityRef}|{zone:string;cell?:number;index?:number};target:{entity:EntityRef}|{zone:string;cell?:number;index?:number};activation?:'select'|'immediate'|'preference';gestures?:{drag?:boolean;swipe?:boolean}}[];
 canvas?:{id:string;operations:JSONValue[];enabled:boolean;command?:Command;allowedTools?:string[];clearEnabled?:boolean;strokeRemaining?:number|null;colors?:string[]};
 clock?:{phase:string;deadline:number;startedAt?:number;player?:number;label?:string};
 chat?:{messages:{id:string;text:string;player?:number;confirmCommand?:Command}[];command?:Command;placeholder?:string};
 menuActions?:{label:string;command:Command;kind?:'action'|'vote'}[];
 roundResult?:JSONValue; prompt?:string; controls?:{label:Message|string;command:Command}[];
 notices?:{id:string;title:string;dismissible?:boolean;summary?:string;details?:string;timer?:{startedAt:number;deadline:number};distribution?:{label:string;value:number;color:"positive"|"negative"|"neutral"}[];actions?:{label:string;command:Command}[]}[];
 vote?:{id:string;title:string;deadline:number;startedAt?:number;against?:number[];againstCommand?:Command;eligible:number[];voted:number[];required:number;accepted:boolean;command?:Command};
}
export interface Presentation {
 metadata?:{name?:Message|string;cover?:{kind:'asset';id:string};rules?:Array<Message|string>;rulebook?:JSONValue;[key:string]:unknown};
 scene(projection:Projection):Scene;
 action?(command:Command,projection:Projection):Message|string;
 event?(event:JSONValue):JSONValue;
 /** Inert scenes bound to ordered public events of the current revision. */
 eventScenes?(projection:Projection):{eventId:number;scene:Scene}[];
}
export interface Diagnostic {code:string;role?:'rules'|'presentation';phase?:string;resource?:string;file?:string;line?:number;column?:number;frames?:{file:string;line:number;column:number}[];hint?:string}
export interface StudioDescriptor {contractVersion:1;rules:string[];presentation:string[];helpers?:string[];types?:string[];support?:string[];checkTypes?:boolean;options?:{[key:string]:JSONValue}}
declare global {
 const SDK:Readonly<{common(id:string):string;text(key:string,params?:{[key:string]:JSONValue}):string;read<T extends object,K extends keyof T>(value:T,key:K):T[K];resource(id:string):{kind:'asset';id:string};voteThreshold(eligible:number):number}>;
 var PlayroomPackDefinition: Definition;
 var PlayroomPackPresentation: Presentation;
}
