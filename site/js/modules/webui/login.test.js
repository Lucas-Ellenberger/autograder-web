import * as Autograder from '../autograder/base.js'
import * as TestUtil from '../autograder/test/server.js'

import * as Base from './base.js'
import * as Context from './context.js'
import * as Routing from './routing.js'

test("Login Page", async function() {
    Base.init(false);

    const testCases = [
        { email: "course-admin@test.edulinq.org", password: "course-admin" },
        { email: "course-grader@test.edulinq.org", password: "course-grader" },
        { email: "course-other@test.edulinq.org", password: "course-other" },
        { email: "course-owner@test.edulinq.org", password: "course-owner" },
        { email: "course-student@test.edulinq.org", password: "course-student" },

        { email: "server-admin@test.edulinq.org", password: "server-admin" },
        { email: "server-creator@test.edulinq.org", password: "server-creator" },
        { email: "server-owner@test.edulinq.org", password: "server-owner" },
        { email: "server-user@test.edulinq.org", password: "server-user" },
    ];

    for (const { email, password } of testCases) {
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

        emailField.value = email;
        passField.value = password;

        let loginPromise = TestUtil.waitForDOMChange('.page-body .content[data-page="home"]');
        document.querySelector('.template-button').click();
        await loginPromise;

        expect(document.title).toContain("Home");

        let currentUserSpan = document.querySelector('.current-user span');
        expect(currentUserSpan).not.toBeNull();

        let displayName = password;
        expect(currentUserSpan.textContent).toContain(displayName);
    }
});
