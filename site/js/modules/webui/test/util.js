import * as Autograder from '../../autograder/base.js';

import * as Context from '../context.js';
import * as Event from '../event.js';
import * as Login from '../login.js';
import * as Routing from '../routing.js';

// A helper function for tests to login as a user.
// This is not in ../login.test.js to avoid importing a test file from other tests.
async function loginUser(displayName) {
    Autograder.clearCredentials();
    Context.clear();
    Routing.init();

    let loginRenderedProimise = Event.getEventPromise(Event.ROUTING_COMPLETED, {
        'path': 'login',
    });

    Routing.redirectLogin();
    await loginRenderedProimise;

    let homeRenderedPromise = Event.getEventPromise(Event.ROUTING_COMPLETED, {
        'path': '',
    });

    let inputParams = {
        'email': `${displayName}@test.edulinq.org`,
        'cleartext': displayName,
    }
    await Login.login(undefined, undefined, document, inputParams);
    await homeRenderedPromise;
}

export {
    loginUser,
}
