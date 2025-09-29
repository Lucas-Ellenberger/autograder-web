import * as Core from '../../../core/index.js';
import * as Test from '../../../test/index.js';

test('Fetch User Attempt, No Result', async function() {
    await Test.loginUser('course-admin');
    await Test.navigate(
            Core.Routing.PATH_ASSIGNMENT_FETCH_USER_ATTEMPT,
            {[Core.Routing.PARAM_COURSE]: 'course101', [Core.Routing.PARAM_ASSIGNMENT]: 'hw0'},
    );

    Test.checkPageBasics('hw0', 'fetch submission attempt');

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toContain('"found-submission": false');
});

test('Fetch User Attempt, Target Other', async function() {
    await Test.loginUser('course-admin');
    await Test.navigate(
            Core.Routing.PATH_ASSIGNMENT_FETCH_USER_ATTEMPT,
            {[Core.Routing.PARAM_COURSE]: 'course101', [Core.Routing.PARAM_ASSIGNMENT]: 'hw0'},
    );

    Test.checkPageBasics('hw0', 'fetch submission attempt');

    document.querySelector('.input-field #targetEmail').value = 'course-student@test.edulinq.org';
    document.querySelector('.input-field #targetSubmission').value = '1697406265';

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toContain('"found-submission": true');
    expect(results).toContain('"id": "course101::hw0::course-student@test.edulinq.org::1697406265"');
    expect(results).toContain('"score": 1');

    let downloadWaitPromisePromise = Core.Event.getEventPromise(Core.Event.EVENT_TYPE_DOWNLOAD_FILE_COMPLETE);
    document.querySelector('.results-area button.download').click();
    await downloadWaitPromisePromise;
});
