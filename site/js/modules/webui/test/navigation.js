import * as Autograder from '../../autograder/index.js';
import * as Core from '../core/index.js';

async function expectFailedNavigation(path, params = undefined, messageSubstring = undefined) {
    let pathComponents = {
        'path': path,
    };

    if (params) {
        pathComponents['params'] = params;
    }

    let renderPromise = Core.Event.getEventPromise(Core.Event.EVENT_TYPE_ROUTING_FAILED, pathComponents);

    Core.Routing.routeComponents(pathComponents);
    let event = await renderPromise;

    if (messageSubstring) {
        expect(event.detail.message).toContain(messageSubstring);
    }
}

// A helper function for tests to login as a user.
// This is not in ../login.test.js to avoid importing a test file from other tests.
async function loginUser(displayName) {
    Autograder.clearCredentials();
    Core.Context.clear();

    let loginRenderedProimise = Core.Event.getEventPromise(Core.Event.EVENT_TYPE_ROUTING_COMPLETE, {
        'path': 'login',
    });

    Core.Routing.redirectLogin();
    await loginRenderedProimise;

    let homeRenderedPromise = Core.Event.getEventPromise(Core.Event.EVENT_TYPE_ROUTING_COMPLETE, {
        'path': '',
    });

    let inputParams = {
        'email': `${displayName}@test.edulinq.org`,
        'cleartext': displayName,
    };
    await Core.login(undefined, undefined, document, inputParams);
    await homeRenderedPromise;
}

async function navigate(path, params = undefined) {
    let pathComponents = {
        'path': path,
    };

    if (params) {
        pathComponents['params'] = params;
    }

    let renderPromise = Core.Event.getEventPromise(Core.Event.EVENT_TYPE_ROUTING_COMPLETE, pathComponents);

    Core.Routing.routeComponents(pathComponents);
    await renderPromise;
}

export {
    expectFailedNavigation,
    loginUser,
    navigate,
}
