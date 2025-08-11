import * as Autograder from '../../autograder/base.js';

import * as Context from '../context.js';
import * as Login from '../login.js';
import * as Routing from '../routing.js';

function waitForDOMChange(selector, target = document, timeout = 3000) {
    return new Promise(function(resolve, reject) {
        const foundElement = target.querySelector(selector);
        if (foundElement) {
            resolve(foundElement);
            return;
        }

        const timeoutId = setTimeout(function() {
            observer.disconnect();
            reject(new Error(`Timeout: Target element not found in DOM: "${selector}".`));
        }, timeout);

        const observer = new MutationObserver(function(mutationsList) {
            const element = target.querySelector(selector);
            if (element) {
                clearTimeout(timeoutId);
                observer.disconnect();
                resolve(element);
            }
        });

        const config = { attributes: true, childList: true, subtree: true };
        observer.observe(target, config);
    });
}

// A helper function for test to login as a user.
// This is not in ../login.test.js to avoid importing a test file from other tests.
async function loginUser(displayName) {
    Autograder.clearCredentials();
    Context.clear();

    Routing.init();

    Routing.redirectLogin();
    let changedToLoginPage = waitForDOMChange('.page-body .content[data-page="login"]');
    await changedToLoginPage;

    let inputParams = {
        'email': `${displayName}@test.edulinq.org`,
        'cleartext': displayName,
    }
    await Login.login(undefined, undefined, document, inputParams);

    let loggedInUser = waitForDOMChange('.page-body .content[data-page="home"]');
    return loggedInUser;
}

export {
    loginUser,
    waitForDOMChange,
}
