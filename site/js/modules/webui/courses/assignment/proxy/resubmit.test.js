import * as Core from '../../../core/index.js';
import * as Test from '../../../test/index.js';

test('Proxy Resubmit, Success', async function() {
    await Test.loginUser('course-admin');
    await Test.navigate(
            Core.Routing.PATH_PROXY_RESUBMIT,
            {[Core.Routing.PARAM_COURSE]: 'course101', [Core.Routing.PARAM_ASSIGNMENT]: 'hw0'},
    );

    Test.checkPageBasics('hw0', 'assignment proxy resubmit');

    document.querySelector('.input-field #email').value = 'course-student@test.edulinq.org';

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toContain('course-student@test.edulinq.org');
    expect(results).toContain('Score');
});

test('Proxy Resubmit, User Not Found', async function() {
    await Test.loginUser('course-admin');
    await Test.navigate(
            Core.Routing.PATH_PROXY_RESUBMIT,
            {[Core.Routing.PARAM_COURSE]: 'course101', [Core.Routing.PARAM_ASSIGNMENT]: 'hw0'},
    );

    Test.checkPageBasics('hw0', 'assignment proxy resubmit');

    document.querySelector('.input-field #email').value = 'zzz@test.edulinq.org';

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toContain('Grading Failed');
    expect(results).toContain('User not found.');
    expect(results).toContain('Submission not found.');
});
