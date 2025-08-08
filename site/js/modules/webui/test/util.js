import * as Autograder from '../../autograder/base.js'

import * as Context from '../context.js'
import * as Routing from '../routing.js'

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
function loginUser(displayName) {
    // Do not send an API request to delete the credentials.
    // The API test data does not contain token deletion data.
    Autograder.clearCredentials(false);
    Context.clear();

    let changedToLoginPage = waitForDOMChange('.page-body .content[data-page="login"]');
    Routing.redirectLogin();

    return changedToLoginPage
        .then(function() {
            // Fill out the user info.
            let emailField = document.querySelector(`.user-input-fields .input-field[data-name="email"] input`);
            let passField = document.querySelector(`.user-input-fields .input-field[data-name="cleartext"] input`);

            emailField.value = `${displayName}@test.edulinq.org`;
            passField.value = displayName;

            let loggedInUser = waitForDOMChange('.page-body .content[data-page="home"]');
            document.querySelector('.template-button').click();

            return loggedInUser;
        })
    ;
}

export {
    loginUser,
    waitForDOMChange,
}
