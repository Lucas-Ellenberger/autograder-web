import * as JSObject from './jsobject.js';

describe("isObject() base", function() {
    // [[input, expected], ...]
    const testCases = [
        // Non-Objetcs
        [undefined, false],
        [null, false],
        ['', false],
        ['a', false],
        [1, false],

        // Arrays
        [[], false],
        [[0], false],

        // Objects
        [{}, true],
        [{a: 1}, true],
    ];

    test.each(testCases)("'%s'", function(input, expected) {
        expect(JSObject.isObject(input)).toBe(expected);
    });
});
