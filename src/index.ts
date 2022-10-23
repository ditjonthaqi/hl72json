
interface NumberRecord<T> {
    length?: never;
    [n: number]: T;
}
export interface Component extends NumberRecord<string> { }

export interface Field extends NumberRecord<
    Component[number] |
    Component
> { }


export interface Segment extends NumberRecord<
    Field[number] |
    Field |
    Array<Field[number] | Field>
> { }

export interface Message extends NumberRecord<Segment> { }


function getDelimters(text: string) {
    let i = 0;
    const delimiters: string[] = [];
    for (const char of text) {
        if (i < 3) {
            i++;
            continue;
        }
        if (i === 8) {
            break
        }
        delimiters.push(char);
        i++;
    }
    return delimiters;
}

function createRegexes(delimiters: string[]) {
    const regexes: RegExp[] = [];
    const specialChars = [
        "+", "-", "&", "|", "!",
        "(", ")", "{", "}",
        "[", "]", "^", "~",
        "*", "?", "\\", ":",
    ];
    const excapeChar = delimiters[3];
    let i = 0;
    for (let delimiter of delimiters) {
        if (i === 3) {
            i++;
            continue;
        }
        let regex: RegExp;
        const delimiterIsSpecialChar = specialChars.includes(delimiter);
        const excapeCharIsSpecialChar = specialChars.includes(excapeChar);
        if (delimiterIsSpecialChar && excapeCharIsSpecialChar) {
            regex = new RegExp(`(?<![\\${excapeChar}])\\${delimiter}`)
        } else if (delimiterIsSpecialChar && !excapeCharIsSpecialChar) {
            regex = new RegExp(`(?<![${excapeChar}])\\${delimiter}`);
        } else if (!delimiterIsSpecialChar && excapeCharIsSpecialChar) {
            regex = new RegExp(`(?<![\\${excapeChar}])${delimiter}`);
        } else {
            regex = new RegExp(`(?<![${excapeChar}])${delimiter}`);
        }
        regexes.push(
            regex
        );
        i++;
    }
    return regexes;
}




function parse(
    message: string,
    segmentDelimiter: string = "\u000a"
): Message {
    const header = message.slice(0, 8);
    const delimiters = getDelimters(header);
    delimiters.push(segmentDelimiter)
    const regexes = createRegexes(delimiters);
    let [
        fieldRegex,
        componentRegex,
        repeatRegex,
        subComponentRegex,
        segmentRegex
    ] = regexes;

    function parseComponent(component: string): Component {
        const { length, ...components } = component.split(subComponentRegex);
        return { ...components };
    }

    function parseField(field: string): Field {
        const { length, ...fields } = field.split(componentRegex).map(c => {
            return subComponentRegex.test(c) ? parseComponent(c) : c;
        });
        return { ...fields };
    }

    function parseSegment(segment: string): Segment {
        const { length, ...segments } = segment.split(fieldRegex).map(f => {
            if (repeatRegex.test(f)) {
                const repeatedFields = f.split(repeatRegex).map(rf => {
                    return componentRegex.test(rf) ? parseField(rf) : rf;
                });
                return repeatedFields
            }
            return componentRegex.test(f) ? parseField(f) : f;
        });

        return { ...segments };
    }

    const segments = message.slice(9).split(segmentRegex).map(s => {
        return parseSegment(s);
    });
    const firstSegment = Object.keys(segments[0]).map(key => {
        return segments[0][+key]
    });
    firstSegment.unshift(header);
    const { length, ...firstSegmentValues } = firstSegment;
    segments[0] = { ...firstSegmentValues };
    const { length: _, ...segmentsValues } = segments;
    return { ...segmentsValues }
}

function stringify(
    message: Message,
    header: string = "MSH|^~\\&",
    segmentDelimiter: string = "\u000a"
) {
    const delimiters = getDelimters(header);
    let [
        fieldDelimter, componentDelimiter,
        repeatDelimiter, excapeChar,
        subComponentDelimiter,
    ] = delimiters;

    function stringifyComponent(component: Component) {
        return Object.keys(component).map(key => {
            return component[+key];
        }).join(subComponentDelimiter);
    }

    function stringifyField(field: Field) {
        return Object.keys(field).map(key => {
            const component = field[+key];
            if (typeof component === "string") {
                return component;
            }
            return stringifyComponent(component);
        }).join(componentDelimiter);
    }

    function stringifySegment(segment: Segment) {
        return Object.keys(segment).map(key => {
            const field = segment[+key];
            if (typeof field === "string") {
                return field;
            } else if (!Array.isArray(field)) {
                return stringifyField(field);
            }
            return field.map(repeatedField => {
                if (typeof repeatedField === "string") {
                    return repeatedField;
                } else if (!Array.isArray(repeatedField)) {
                    return stringifyField(repeatedField);
                }
            }).join(repeatDelimiter);

        }).join(fieldDelimter);
    }

    return Object.keys(message).map(key => {
        return stringifySegment(message[+key]);
    }).join(segmentDelimiter);
}

export interface HL7 {
    stringify: typeof stringify;
    parse: typeof parse;
}

export default {
    stringify,
    parse
} as HL7;