import * as Core from '../../../core/index.js';
import * as Test from '../../../test/index.js';

test('Proxy Regrade', async function() {
    await Test.loginUser('course-admin');
    await Test.navigate(
            Core.Routing.PATH_PROXY_REGRADE,
            {[Core.Routing.PARAM_COURSE]: 'course101', [Core.Routing.PARAM_ASSIGNMENT]: 'hw0'},
    );

    Test.checkPageBasics('hw0', 'assignment proxy regrade');

    document.querySelector('.input-field #users').value = JSON.stringify([
            "*",
            "-course-admin@test.edulinq.org",
    ]);

    await Test.submitTemplate();

    let results = document.querySelector('.results-area code').innerHTML;
    let output = JSON.parse(results);
    expect(output['resolved-users'].length).toEqual(4);
});
