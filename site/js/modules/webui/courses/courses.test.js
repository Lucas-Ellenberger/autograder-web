import * as Core from '../core/index.js';
import * as Test from '../test/index.js';

test('Enrolled Courses', async function() {
    await Test.loginUser('course-student');
    await Test.navigate(Core.Routing.PATH_COURSES);

    Test.checkPageBasics('Enrolled Courses', 'enrolled courses');

    const expectedLabelNames = [
        'Course 101',
        'Course Using Different Languages',
    ];
    Test.checkCards(expectedLabelNames);
});
