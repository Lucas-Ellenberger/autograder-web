import * as Autograder from '../autograder/base.js'
import * as TestUtil from '../autograder/test/server.js'

import * as Base from './base.js'
import * as Context from './context.js'
import * as Routing from './routing.js'

test("Login Page", async function() {
    Base.init(false);

    const testCases = [
        { displayName: "course-admin" },
        { displayName: "course-grader" },
        { displayName: "course-other" },
        { displayName: "course-owner" },
        { displayName: "course-student" },

        { displayName: "server-admin" },
        { displayName: "server-creator" },
        { displayName: "server-owner" },
        { displayName: "server-user" },
    ];

    for (const { displayName } of testCases) {
        loginUser(displayName)
            .then(function() {
                expect(document.title).toContain("Home");

                let currentUserSpan = document.querySelector('.current-user span');
                expect(currentUserSpan).not.toBeNull();

                expect(currentUserSpan.textContent).toContain(displayName);
            })
        ;
    }
});

async function loginUser(displayName) {
    // Do not send an API request to delete the credentials.
    // The API test data does not contain token deletion data.
    Autograder.clearCredentials(false);
    Context.clear();

    let changedToLogin = TestUtil.waitForDOMChange('.page-body .content[data-page="login"]');
    Routing.redirectLogin();
    await changedToLogin;

    // Fill out the user info.
    let emailField = document.querySelector(`.user-input-fields .input-field[data-name="email"] input`);
    let passField = document.querySelector(`.user-input-fields .input-field[data-name="cleartext"] input`);

    emailField.value = `${displayName}@test.edulinq.org`;
    passField.value = displayName;

    let loginPromise = TestUtil.waitForDOMChange('.page-body .content[data-page="home"]');
    document.querySelector('.template-button').click();
    await loginPromise;
}

export {
    loginUser,
}
