import * as Base from './base.js'
import * as Routing from './routing.js'

test("Login Page", function() {
    Base.init(false);

    Routing.redirectLogin();
	console.log("bananas");

    return new Promise(function() {
        console.log("first promise");

		setTimeout(function() {
			console.log("Delayed for 1 second.");
		}, 1000);

        return new Promise(function() {
            console.log("second promise");
            console.log(document.title);
        });
    });
});
