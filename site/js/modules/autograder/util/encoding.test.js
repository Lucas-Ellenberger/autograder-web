import * as Encoding from './encoding.js';

describe("b64Decode() base", function() {
    // [[input, expected], ...]
    const testCases = [
        // Empty
        ['', ''],

        // Basic
        ['YQ==', 'a'],
    ];

    test.each(testCases)("'%s'", async function(input, expected) {
        let actualBlob = await Encoding.b64Decode(input);
        let actualText = await actualBlob.text();
        expect(actualText).toBe(expected);
    });
});

