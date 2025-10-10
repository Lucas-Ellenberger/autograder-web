import * as Core from '../core/index.js';
import * as Test from '../test/index.js';

test('Server Courses List', async function() {
    await Test.loginUser('server-admin');
    await Test.navigate(Core.Routing.PATH_SERVER_COURSES_LIST, undefined, Core.Event.EVENT_TYPE_NONTEMPLATE_LOAD_COMPLETE);

    Test.checkPageBasics('Server Courses', 'server courses');

    const expectedLabelNames = [
        'Course 101',
        'Course Using Different Languages',
    ];
    Test.checkCards(expectedLabelNames);
});
