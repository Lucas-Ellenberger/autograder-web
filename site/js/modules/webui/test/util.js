import * as Autograder from '../../autograder/base.js';

import * as Context from '../context.js';
import * as Events from '../events.js';
import * as Login from '../login.js';
import * as Routing from '../routing.js';

// A helper function for test to login as a user.
// This is not in ../login.test.js to avoid importing a test file from other tests.
async function loginUser(displayName) {
    Autograder.clearCredentials();
    Context.clear();
    Routing.init();

    let loginEvent = Events.eventManager.waitForEvent(Events.HANDLER_COMPLETED, {
        'path': 'login',
    });

    Routing.redirectLogin();
    await loginEvent;

    let homeEvent = Events.eventManager.waitForEvent(Events.HANDLER_COMPLETED, {
        'path': '',
    });

    let inputParams = {
        'email': `${displayName}@test.edulinq.org`,
        'cleartext': displayName,
    }
    await Login.login(undefined, undefined, document, inputParams);

    return homeEvent;
}

export {
    loginUser,
}
