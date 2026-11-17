/** Studio contract v1. Player application integration is a separate boundary. */
export type JSONValue = null | boolean | number | string | JSONValue[] | {[key:string]:JSONValue};
export type Command = {type:string; [key:string]:JSONValue};
export interface Timeline {turn:number;starts:number[];round?:number;roundStarts?:number[];preparing?:boolean;playStart?:number}
export interface Position {playerCount:number; turn:number; status:'playing'|'finished'; winners:number[]; data:{[key:string]:JSONValue}; rng?:number; revision?:number; clock?:number;preset?:string;timeline?:Timeline}
export interface Projection {contractVersion:1; game:string; viewer:number; actor:number; audience:'public'|'player'; playerCount:number; turn:number; status:'playing'|'finished'; winners:number[]; data:{[key:string]:JSONValue}; actions:Command[]; inputs?:InputChoice[]; events:JSONValue[];choicesVersion?:1;preset?:string;timeline?:Timeline;decisionWindow?:DecisionWindow|null}
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
 advance?(position:Position,now:number):Transition|null;
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
 players:({player:number;metrics:Metric[]}&{[key:string]:unknown})[];
 cells?:JSONValue[]; rows?:number|JSONValue[]; columns?:number; dice?:JSONValue[];
 geometry?:JSONValue; zones?:JSONValue[]; objects?:JSONValue[]; interactions?:JSONValue[];
 canvas?:{id:string;operations:JSONValue[];enabled:boolean;command?:Command;allowedTools?:string[];clearEnabled?:boolean;strokeRemaining?:number|null;colors?:string[]};
 clock?:{phase:string;deadline:number;startedAt?:number;player?:number;label?:string};
 chat?:{messages:{id:string;text:string;player?:number;confirmCommand?:Command}[];command?:Command;placeholder?:string};
 menuActions?:{label:string;command:Command}[];
 roundResult?:JSONValue; prompt?:string; controls?:JSONValue[];
 notices?:{id:string;title:string;dismissible?:boolean;summary?:string;details?:string;timer?:{startedAt:number;deadline:number};distribution?:{label:string;value:number;color:"positive"|"negative"|"neutral"}[];actions?:{label:string;command:Command}[]}[];
 vote?:{id:string;title:string;deadline:number;startedAt?:number;against?:number[];againstCommand?:Command;eligible:number[];voted:number[];required:number;accepted:boolean;command?:Command};
}
export interface Presentation {
 metadata?:{name?:Message|string;rules?:Array<Message|string>;rulebook?:JSONValue;[key:string]:unknown};
 scene(projection:Projection):Scene;
 action?(command:Command,projection:Projection):Message|string;
 event?(event:JSONValue):JSONValue;
}
export interface Diagnostic {code:string;role?:'rules'|'presentation';phase?:string;resource?:string;file?:string;line?:number;column?:number;frames?:{file:string;line:number;column:number}[];hint?:string}
export interface StudioDescriptor {contractVersion:1;rules:string[];presentation:string[];helpers?:string[];types?:string[];support?:string[];checkTypes?:boolean;options?:{[key:string]:JSONValue}}
declare global {
 const SDK:Readonly<{read<T extends object,K extends keyof T>(value:T,key:K):T[K];resource(id:string):{kind:'asset';id:string};voteThreshold(eligible:number):number}>;
 var PlayroomPackDefinition: Definition;
 var PlayroomPackPresentation: Presentation;
}
