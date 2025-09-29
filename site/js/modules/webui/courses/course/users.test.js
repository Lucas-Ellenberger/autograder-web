import * as Core from '../../core/index.js';
import * as Test from '../../test/index.js';

test('Course Users List', async function() {
    const targetCourse = 'course101';
    const expectedEmails = [
        'course-admin@test.edulinq.org',
        'course-grader@test.edulinq.org',
        'course-other@test.edulinq.org',
        'course-owner@test.edulinq.org',
        'course-student@test.edulinq.org',
    ];

    await Test.loginUser('course-admin');
    await Test.navigate(Core.Routing.PATH_COURSE_USERS_LIST, {[Core.Routing.PARAM_COURSE]: targetCourse});

    Test.checkPageBasics(targetCourse, 'users');

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;

    for (const expectedEmail of expectedEmails) {
        expect(results).toContain(expectedEmail);
    }
});
