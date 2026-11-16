/** Studio contract v1. Player application integration is a separate boundary. */
export type JSONValue = null | boolean | number | string | JSONValue[] | {[key:string]:JSONValue};
export type Command = {type:string; [key:string]:JSONValue};
export interface Position {playerCount:number; turn:number; status:'playing'|'finished'; winners:number[]; data:{[key:string]:JSONValue}; rng?:number; revision?:number; clock?:number}
export interface Projection {contractVersion:1; game:string; viewer:number; actor:number; audience:'public'|'player'; playerCount:number; turn:number; status:'playing'|'finished'; winners:number[]; data:{[key:string]:JSONValue}; actions:Command[]; inputs?:InputChoice[]; events:JSONValue[]}
export interface Message {key:string; params?:{[key:string]:JSONValue | Message}}
export interface Choice {command:Command; visibility:'public'|'private'}
export type InputField={kind:'text';maxLength:number;minLength?:number;label?:string}|{kind:'integer';min:number;max:number;label?:string}|{kind:'boolean';label?:string}|{kind:'enum';values:Array<string|number|boolean>;label?:string}|{kind:'ink';label?:string};
export interface InputChoice extends Choice {fields:{[key:string]:InputField};label?:string}
export type InkOperation={kind:'stroke';id:string;tool:'brush'|'eraser';color:string;width:1|2|3;points:number[][]}|{kind:'fill';id:string;color:string;x:number;y:number}|{kind:'clear';id:string};
export interface EventDraft {type:string;actor:number|null;params:{[key:string]:JSONValue};visibility:{kind:'public'}|{kind:'players';players:number[]};publicEvent?:EventDraft}
export interface Result {winners:number[];places:number[];metrics:{id:string;values:number[];order?:'asc'|'desc'}[]}
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
 score?(position:Position):number[];
 bot?(projection:Projection,actor:number,choices:Command[],memory:JSONValue,context:unknown):Command;
}
export interface Scene {
 contractVersion:1; id:string; family:string;
 players:({player:number;metrics:JSONValue[]}&{[key:string]:JSONValue})[];
 cells?:JSONValue[]; rows?:number|JSONValue[]; columns?:number; dice?:JSONValue[];
 geometry?:JSONValue; zones?:JSONValue[]; objects?:JSONValue[]; interactions?:JSONValue[];
 canvas?:{id:string;operations:JSONValue[];enabled:boolean;command?:Command;allowedTools?:string[];clearEnabled?:boolean;strokeRemaining?:number|null;colors?:string[]};
 clock?:{phase:string;deadline:number;label?:string};
 chat?:{messages:{id:string;text:string;player?:number;confirmCommand?:Command}[];command?:Command;placeholder?:string};
 roundResult?:JSONValue; prompt?:string; controls?:JSONValue[];
 vote?:{id:string;title:string;deadline:number;eligible:number[];voted:number[];required:number;accepted:boolean;command?:Command};
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
