import * as Base from './base.js';
import * as TestUtil from './test/util.js';

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

    let allTestCasePromises = Promise.resolve();
    for (const testCase of testCases) {
        allTestCasePromises = allTestCasePromises
            .then(function() {
                return testLoginUser(testCase.displayName);
            })
        ;
    }

    return allTestCasePromises;
});

async function testLoginUser(displayName) {
    await TestUtil.loginUser(displayName);

    expect(document.title).toContain("Home");

    let currentUserSpan = document.querySelector('.current-user span');
    expect(currentUserSpan.textContent).toContain(displayName);
}
