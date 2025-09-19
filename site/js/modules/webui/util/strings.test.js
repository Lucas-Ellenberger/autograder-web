import * as Strings from './strings.js';

describe("caseInsensitiveStringCompare() base", function() {
    // [[a, b, expected], ...]
    const testCases = [
        ["A", "A", 0],
        ["a", "a", 0],
        ["A", "a", 0],
        ["a", "A", 0],

        ["A", "B", -1],
        ["a", "b", -1],
        ["A", "b", -1],
        ["a", "B", -1],

        ["B", "A", 1],
        ["b", "a", 1],
        ["B", "a", 1],
        ["b", "A", 1],
    ];

    test.each(testCases)("'%s' vs '%s'", function(a, b, expected) {
        expect(Strings.caseInsensitiveStringCompare(a, b)).toBe(expected);
    });
});

describe("cleanText() base", function() {
    // [[input, expected], ...]
    const testCases = [
        // Empty
        ['', ''],

        // Whitespace
        [' ', ''],
        [' \t\n\r ', ''],
        [' a', 'a'],
        ['a\n', 'a'],
        [' a\t', 'a'],

        // Word Breaks
        ['a-b', 'a b'],
        ['a_b', 'a b'],
        ['a _b', 'a b'],
        ['a_ b', 'a b'],
        ['a _ b', 'a b'],
    ];

    test.each(testCases)("'%s'", function(input, expected) {
        expect(Strings.cleanText(input)).toBe(expected);
    });
});

describe("titleCase() base", function() {
    // [[input, clean?, expected], ...]
    const testCases = [
        // Empty
        ['', true, ''],

        // Single Word
        ['a', true, 'A'],
        ['A', true, 'A'],
        ['ab', true, 'Ab'],
        ['AB', true, 'Ab'],

        // Multiple Words
        ['a b', true, 'A B'],
        ['A B', true, 'A B'],
        ['ab ab', true, 'Ab Ab'],
        ['AB AB', true, 'Ab Ab'],

        // Word Breaks
        ['a-b', true, 'A B'],
        ['a_b', true, 'A B'],
        ['a \t b', true, 'A B'],

        // Non-Word Breaks
        ["a'b", true, "A'b"],

        // No Clean
        ['a-b', false, 'A-b'],
    ];

    test.each(testCases)("'%s', %s", function(input, clean, expected) {
        expect(Strings.titleCase(input, clean)).toBe(expected);
    });
});
