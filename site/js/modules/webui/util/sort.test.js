import * as Sort from './sort.js';
import * as Strings from './strings.js';

describe("orderingCompare() base", function() {
    // [[a, b, ordering, fallback, expected], ...]
    const testCases = [
        // All In Ordering
        ['a', 'a', ['A', 'a'], Strings.stringCompare, 0],
        ['a', 'A', ['A', 'a'], Strings.stringCompare, 1],
        ['A', 'a', ['A', 'a'], Strings.stringCompare, -1],

        // One In Ordering
        ['a', 'A', ['a'], Strings.stringCompare, -1],
        ['A', 'a', ['a'], Strings.stringCompare, 1],

        // No Ordering, Case Sensitive
        ['a', 'a', [], Strings.stringCompare, 0],
        ['a', 'A', [], Strings.stringCompare, -1],
        ['A', 'a', [], Strings.stringCompare, 1],

        // No Ordering, Case Insensitive
        ['a', 'a', [], Strings.caseInsensitiveStringCompare, 0],
        ['a', 'A', [], Strings.caseInsensitiveStringCompare, 0],
        ['A', 'a', [], Strings.caseInsensitiveStringCompare, 0],
    ];

    test.each(testCases)("'%s' vs '%s' -- %s", function(a, b, ordering, fallback, expected) {
        expect(Sort.orderingCompare(a, b, ordering, fallback)).toBe(expected);
    });
});
