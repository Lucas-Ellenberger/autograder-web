import * as Autograder from '../autograder/base.js'
import * as TestUtil from '../autograder/test/server.js'

import * as Base from './base.js'
import * as Context from './context.js'
import * as Routing from './routing.js'

test("Login Page", function() {
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

    function testLoginUser(displayName) {
        return loginUser(displayName)
            .then(function() {
                expect(document.title).toContain("Home");

                let currentUserSpan = document.querySelector('.current-user span');
                expect(currentUserSpan).not.toBeNull();

                expect(currentUserSpan.textContent).toContain(displayName);
            })
        ;
    }

    let allTestCasePromises = Promise.resolve();
    for (const { displayName } of testCases) {
        allTestCasePromises = allTestCasePromises
            .then(function() {
                return testLoginUser(displayName);
            })
        ;
    }

    return allTestCasePromises;
});

function loginUser(displayName) {
    // Do not send an API request to delete the credentials.
    // The API test data does not contain token deletion data.
    Autograder.clearCredentials(false);
    Context.clear();


    let changedToLoginPage = TestUtil.waitForDOMChange('.page-body .content[data-page="login"]');
    Routing.redirectLogin();

    return changedToLoginPage
        .then(function() {
            // Fill out the user info.
            let emailField = document.querySelector(`.user-input-fields .input-field[data-name="email"] input`);
            let passField = document.querySelector(`.user-input-fields .input-field[data-name="cleartext"] input`);

            emailField.value = `${displayName}@test.edulinq.org`;
            passField.value = displayName;

            let loggedInUser = TestUtil.waitForDOMChange('.page-body .content[data-page="home"]');
            document.querySelector('.template-button').click();

            return loggedInUser;
        })
    ;
}

export {
    loginUser,
}
