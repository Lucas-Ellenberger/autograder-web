import * as Base from './base.js'
import * as Routing from './routing.js'

import * as TestUtil from '../autograder/test/server.js'

test("Login Page", async function() {
    Base.init(false);

    console.log("bananas");
    console.log(document.children[0].innerHTML);

    const domChanged = TestUtil.waitForDOMChange();
    Routing.redirectLogin();
    await domChanged;

    console.log(document.children[0].innerHTML);
    expect(document.body.innerHTML).toContain(`data-page="login"`);
});
