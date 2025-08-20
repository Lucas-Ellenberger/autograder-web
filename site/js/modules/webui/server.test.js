import * as Base from './base.js';
import * as Event from './event.js';
import * as Routing from './routing.js';
import * as TestUtil from './test/util.js';

test('Nav Server Actions', async function() {
    Base.init(false);

    // Each test case is a list of [user, [expected card labels]].
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

    for (const testCase of testCases) {
        const user = testCase[0];
        await TestUtil.loginUser(user);

        await navigateToServerActions();

        TestUtil.checkPageBasics('Server Actions', 'server actions');

        const expectedLabelNames = testCase[1];
        TestUtil.checkCards(expectedLabelNames);
    }
});

async function navigateToServerActions() {
    let pathComponents = {
        'path': Routing.PATH_SERVER,
    };

    let serverActionsRenderedPromise = Event.getEventPromise(Event.EVENT_TYPE_ROUTING_COMPLETE, pathComponents);

    Routing.routeComponents(pathComponents);
    await serverActionsRenderedPromise;
}
