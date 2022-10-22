"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
function getDelimters(text) {
    var i = 0;
    var delimiters = [];
    for (var _i = 0, text_1 = text; _i < text_1.length; _i++) {
        var char = text_1[_i];
        if (i < 3) {
            i++;
            continue;
        }
        if (i === 8) {
            break;
        }
        delimiters.push(char);
        i++;
    }
    return delimiters;
}
function createRegexes(delimiters) {
    var regexes = [];
    var specialChars = [
        "+", "-", "&", "|", "!",
        "(", ")", "{", "}",
        "[", "]", "^", "~",
        "*", "?", "\\", ":",
    ];
    var excapeChar = delimiters[3];
    var i = 0;
    for (var _i = 0, delimiters_1 = delimiters; _i < delimiters_1.length; _i++) {
        var delimiter = delimiters_1[_i];
        if (i === 3) {
            i++;
            continue;
        }
        var regex = void 0;
        var delimiterIsSpecialChar = specialChars.includes(delimiter);
        var excapeCharIsSpecialChar = specialChars.includes(excapeChar);
        if (delimiterIsSpecialChar && excapeCharIsSpecialChar) {
            regex = new RegExp("(?<![\\".concat(excapeChar, "])\\").concat(delimiter));
        }
        else if (delimiterIsSpecialChar && !excapeCharIsSpecialChar) {
            regex = new RegExp("(?<![".concat(excapeChar, "])\\").concat(delimiter));
        }
        else if (!delimiterIsSpecialChar && excapeCharIsSpecialChar) {
            regex = new RegExp("(?<![\\".concat(excapeChar, "])").concat(delimiter));
        }
        else {
            regex = new RegExp("(?<![".concat(excapeChar, "])").concat(delimiter));
        }
        regexes.push(regex);
        i++;
    }
    return regexes;
}
function parse(message, segmentDelimiter) {
    if (segmentDelimiter === void 0) { segmentDelimiter = "\u000a"; }
    var header = message.slice(0, 8);
    var delimiters = getDelimters(header);
    delimiters.push(segmentDelimiter);
    var regexes = createRegexes(delimiters);
    var fieldRegex = regexes[0], componentRegex = regexes[1], repeatRegex = regexes[2], subComponentRegex = regexes[3], segmentRegex = regexes[4];
    function parseComponent(component) {
        var _a = component.split(subComponentRegex), length = _a.length, components = __rest(_a, ["length"]);
        return __assign({}, components);
    }
    function parseField(field) {
        var _a = field.split(componentRegex).map(function (c) {
            return subComponentRegex.test(c) ? parseComponent(c) : c;
        }), length = _a.length, fields = __rest(_a, ["length"]);
        return __assign({}, fields);
    }
    function parseSegment(segment) {
        var _a = segment.split(fieldRegex).map(function (f) {
            if (repeatRegex.test(f)) {
                var repeatedFields = f.split(repeatRegex).map(function (rf) {
                    return componentRegex.test(rf) ? parseField(rf) : rf;
                });
                return repeatedFields;
            }
            return componentRegex.test(f) ? parseField(f) : f;
        }), length = _a.length, segments = __rest(_a, ["length"]);
        return __assign({}, segments);
    }
    var segments = message.slice(9).split(segmentRegex).map(function (s) {
        return parseSegment(s);
    });
    var firstSegment = Object.keys(segments[0]).map(function (key) {
        return segments[0][+key];
    });
    firstSegment.unshift(header);
    var length = firstSegment.length, firstSegmentValues = __rest(firstSegment, ["length"]);
    segments[0] = __assign({}, firstSegmentValues);
    var _ = segments.length, segmentsValues = __rest(segments, ["length"]);
    return __assign({}, segmentsValues);
}
function stringify(message, header, segmentDelimiter) {
    if (header === void 0) { header = "MSH|^~\\&"; }
    if (segmentDelimiter === void 0) { segmentDelimiter = "\u000a"; }
    var delimiters = getDelimters(header);
    var fieldDelimter = delimiters[0], componentDelimiter = delimiters[1], repeatDelimiter = delimiters[2], excapeChar = delimiters[3], subComponentDelimiter = delimiters[4];
    function stringifyComponent(component) {
        return Object.keys(component).map(function (key) {
            return component[+key];
        }).join(subComponentDelimiter);
    }
    function stringifyField(field) {
        return Object.keys(field).map(function (key) {
            var component = field[+key];
            if (typeof component === "string") {
                return component;
            }
            return stringifyComponent(component);
        }).join(componentDelimiter);
    }
    function stringifySegment(segment) {
        return Object.keys(segment).map(function (key) {
            var field = segment[+key];
            if (typeof field === "string") {
                return field;
            }
            else if (!Array.isArray(field)) {
                return stringifyField(field);
            }
            return field.map(function (repeatedField) {
                if (typeof repeatedField === "string") {
                    return repeatedField;
                }
                else if (!Array.isArray(repeatedField)) {
                    return stringifyField(repeatedField);
                }
            }).join(repeatDelimiter);
        }).join(fieldDelimter);
    }
    return Object.keys(message).map(function (key) {
        return stringifySegment(message[+key]);
    }).join(segmentDelimiter);
}
exports.default = {
    stringify: stringify,
    parse: parse
};
