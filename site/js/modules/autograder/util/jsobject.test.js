import * as JSObject from './jsobject.js';

describe("removeUndefinedValues() base", function() {
    // [[input, expected], ...]
    const testCases = [
        // Empty
        [{}, {}],

        // Basic
        [{ a: undefined }, {}],
        [{ a: 1 }, { a: 1 }],
        [{ a: true }, { a: true }],
        [{ a: 'string' }, { a: 'string' }],
        [{ a: ['array'] }, { a: ['array'] }],

        // Other falsy values
        [{ a: 0 }, { a: 0 }],
        [{ a: false }, { a: false }],
        [{ a: '' }, { a: '' }],
        [{ a: [] }, { a: [] }],
        [{ a: null }, { a: null }],
    ];

    test.each(testCases)("'%s'", function(input, expected) {
        // Function edits input object directly.
        JSObject.removeUndefinedValues(input);

        expect(input).toEqual(expected);
    });
});
