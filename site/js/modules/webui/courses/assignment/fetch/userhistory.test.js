import * as Core from '../../../core/index.js';
import * as Test from '../../../test/index.js';

test('Fetch User History, Success', async function() {
    await Test.loginUser('course-admin');
    await Test.navigate(
            Core.Routing.PATH_USER_HISTORY,
            {[Core.Routing.PARAM_COURSE]: 'course101', [Core.Routing.PARAM_ASSIGNMENT]: 'hw0'},
    );

    Test.checkPageBasics('hw0', 'user assignment history');

    document.querySelector('.input-field #targetUser').value = 'course-student@test.edulinq.org';

    await Test.submitTemplate();

    let results = document.querySelector('.results-area').innerHTML;
    let tableRows = results.matchAll('<tr>').toArray().length;
    expect(tableRows).toEqual(4);
});
