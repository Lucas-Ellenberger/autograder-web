import * as Core from '../core/index.js';
import * as Test from '../test/index.js';

describe('Nav Server Actions', function() {
    // [[user, [expected card labels]], ...].
    const testCases = [
        [
            'server-user',
            [
                'API Documentation',
                'Call API',
            ],
        ],
        [
            'server-creator',
            [
                'API Documentation',
                'Call API',
            ],
        ],
        [
            'server-admin',
            [
                'API Documentation',
                'Call API',
                'List Users',
            ],
        ],
    ];

    test.each(testCases)("%s", async function(user, expectedLabelNames) {
        await Test.loginUser(user);
        await Test.navigate(Core.Routing.PATH_SERVER);

        Test.checkPageBasics('Server Actions', 'server actions');
        Test.checkCards(expectedLabelNames);
    });
});
