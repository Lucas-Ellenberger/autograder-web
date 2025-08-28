import fs from 'node:fs';
import path from 'node:path';

import * as Base from './base.js';
import * as Event from './event.js';
import * as Input from './input.js'
import * as Routing from './routing.js';
import * as TestUtil from './test/util.js';

test('Submit Assignment', async function() {
    Base.init(false);

    await TestUtil.loginUser('course-admin');

    let targetCourse = 'course101';
    let targetAssignment = 'hw0';
    let pathComponents = {
        'path': Routing.PATH_SUBMIT,
        'params': {
            [Routing.PARAM_ASSIGNMENT]: targetAssignment,
            [Routing.PARAM_COURSE]: targetCourse,
        },
    };

    let loadWaitPromise = Event.getEventPromise(Event.EVENT_TYPE_ROUTING_COMPLETE, pathComponents);

    Routing.routeComponents(pathComponents);
    await loadWaitPromise;

    TestUtil.checkPageBasics(targetAssignment, 'assignment submit');

    const fileContent = fs.readFileSync(path.join('site', 'js', 'modules', 'autograder', 'test', 'data', 'hw0_solution.py'), 'utf8');
    const fileObj = new File([fileContent], 'hw0_solution.py');
    document.querySelector('div[data-name="files"] input')[Input.TEST_FILES_KEY] = [fileObj];

    let resultWaitPromise = Event.getEventPromise(Event.EVENT_TYPE_TEMPLATE_RESULT_COMPLETE);
    document.querySelector('.template-button').click();
    await resultWaitPromise;

    let results = document.querySelector('.results-area').innerHTML;
    expect(results).toMatch(targetCourse);
    expect(results).toMatch(targetAssignment);
    expect(results).toMatch('Score');
});
