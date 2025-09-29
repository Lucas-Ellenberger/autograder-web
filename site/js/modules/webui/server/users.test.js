import * as Core from '../core/index.js';
import * as Render from '../render/index.js';
import * as Test from '../test/index.js';

const SERVER_USERS = [
    'course-admin@test.edulinq.org',
    'course-grader@test.edulinq.org',
    'course-other@test.edulinq.org',
    'course-owner@test.edulinq.org',
    'course-student@test.edulinq.org',
    'server-admin@test.edulinq.org',
    'server-creator@test.edulinq.org',
    'server-owner@test.edulinq.org',
    'server-user@test.edulinq.org',
];

test('Server Users List', async function() {
    await Test.loginUser('server-admin');
    await Test.navigate(Core.Routing.PATH_SERVER_USERS_LIST);

    Test.checkPageBasics('List Users', 'list users');

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;

    for (const expectedEmail of SERVER_USERS) {
        expect(results).toContain(expectedEmail);
    }
});

describe('Server Users List, Output Switching', function() {
    // [[mode, prefix], ...]
    const testCases = [
        [Render.API_OUTPUT_SWITCHER_JSON, '"email": "'],
        [Render.API_OUTPUT_SWITCHER_TABLE, '<td>'],
        [Render.API_OUTPUT_SWITCHER_TEXT, 'Email: '],
    ];

    test.each(testCases)("%s", async function(mode, prefix) {
        await Test.loginUser('server-admin');
        await Test.navigate(Core.Routing.PATH_SERVER_USERS_LIST);

        Test.checkPageBasics('List Users', 'list users');

        await Test.submitTemplate();

        let button = document.querySelector(`.output-switcher .controls button.${mode.toLowerCase()}`);
        button.click();

        let results = document.querySelector('.results-area').innerHTML;
        for (const expectedEmail of SERVER_USERS) {
            expect(results).toContain(`${prefix}${expectedEmail}`);
        }
    });
});
