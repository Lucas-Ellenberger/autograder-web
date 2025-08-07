import * as Base from './base.js'
import * as Routing from './routing.js'

import * as Core from '../autograder/core.js'

import * as TestUtil from '../autograder/test/server.js'

test("Login Page", async function() {
    Base.init(false);

    // There is a beforeAll() function to auto set credentials.
    // TODO: How should we start loading in the test user?
    Core.clearCredentials(false);

    let changedToLogin = TestUtil.waitForDOMChange('.page-body .content[data-page="login"]');
    Routing.redirectLogin();
    await changedToLogin;

    // Fill out the user info.
    let emailField = document.querySelector(`.user-input-fields .input-field[data-name="email"] input`);
    emailField.value = "course-admin@test.edulinq.org";

    let passField = document.querySelector(`.user-input-fields .input-field[data-name="cleartext"] input`);
    passField.value = "course-admin";

    let changedToHome = TestUtil.waitForDOMChange('.page-body .content[data-page="home"]');
    document.querySelector(`.template-button`).click();
    await changedToHome;

    console.log(document.children[0].innerHTML);
    expect(document.title).toContain("Home");
});
