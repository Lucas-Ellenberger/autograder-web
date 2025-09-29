import * as Hash from './hash.js';

describe("sha256() base", function() {
    // [[input, expected], ...]
    const testCases = [
        // Empty
        ['', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],

        // Basic
        ['a', 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb'],
        ['A', '559aead08264d5795d3909718cdd05abd49572e84fe55590eef31a88a08fdffd'],
    ];

    test.each(testCases)("'%s'", function(input, expected) {
        expect(Hash.sha256(input)).toBe(expected);
    });
});
