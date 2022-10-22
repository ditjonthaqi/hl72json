interface NumberRecord<T> {
    length?: never;
    [n: number]: T;
}
export interface Component extends NumberRecord<string> {
}
export interface Field extends NumberRecord<Component[number] | Component> {
}
export interface Segment extends NumberRecord<Field[number] | Field | Array<Field[number] | Field>> {
}
export interface Message extends NumberRecord<Segment> {
}
declare function parse(message: string, segmentDelimiter?: string): Message;
declare function stringify(message: Message, header?: string, segmentDelimiter?: string): string;
export interface HL7 {
    stringify: typeof stringify;
    parse: typeof parse;
}
declare const _default: HL7;
export default _default;
