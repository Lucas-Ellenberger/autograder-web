import * as Base from './base.js'
import * as TestUtil from './test/util.js'

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
        return TestUtil.loginUser(displayName)
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
