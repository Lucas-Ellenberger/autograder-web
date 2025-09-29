import * as Core from '../../core/index.js';
import * as Test from '../../test/index.js';

test('Course Update', async function() {
    const targetCourse = 'course101';
    const expectedStrings = [
        '"success": true',
        '"created": false',
        '"updated": true',
        'course-admin@test.edulinq.org',
        'autograder.course101.hw0',
        'submission.py',
    ];

    await Test.loginUser('course-admin');
    await Test.navigate(Core.Routing.PATH_COURSE_UPDATE, {[Core.Routing.PARAM_COURSE]: targetCourse});

    Test.checkPageBasics(targetCourse, 'update course');

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    for (const string of expectedStrings) {
        expect(results).toContain(string);
    }
});
