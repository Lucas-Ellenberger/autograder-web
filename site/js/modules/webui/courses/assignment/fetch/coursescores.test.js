import * as Core from '../../../core/index.js';
import * as Test from '../../../test/index.js';

test('Fetch Course Scores', async function() {
    await Test.loginUser('course-admin');
    await Test.navigate(
            Core.Routing.PATH_ASSIGNMENT_FETCH_COURSE_SCORES,
            {[Core.Routing.PARAM_COURSE]: 'course101', [Core.Routing.PARAM_ASSIGNMENT]: 'hw0'},
    );

    Test.checkPageBasics('hw0', 'fetch course assignment scores');

    document.querySelector('.input-field #target-users').value = '["student"]';

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toContain('course101::hw0::course-student@test.edulinq.org::1697406272');
});
