# Development Notes

## Autograder API Interface

This project interfaces with the Autograder API through functions for each API endpoint.
These functions return a promise that resolves to a response from the Autograder API.
Endpoint function parameters should match the Autograder API payload content.
Payload content includes all configurable parameters corresponding to each endpoint,
with the exception of credientials which are generally handled in [`sendRequest()`](/site/js/modules/autograder/core.js).
`sendRequest()` will remove any payload keys with `undefined` values,
if you want to send an explicitly null/nil value, use `null`.
We recommend template users setting these parameters in their `onSubmit` callback.

## Style

### Arrow Functions

This project heavily prefers the use of the `function` keyword over the use of
[arrow functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions).
Arrow functions may only be used for one line callbacks.
If the RHS of the arrow function is more than a single expression,
use the `function` keyword instead.
Both the RHS and LHS of the arrow must be wrapped in parentheses.

Consider the following cases:
```javascript
    // Good: One line, parentheses on both sides.
    numbers.map((number) => (number * 2));

    // Bad: Missing parentheses on both sides.
    numbers.map(number => number * 2);

    // Bad: Missing parentheses on RHS.
    numbers.map((number) => number * 2);

    // Bad: Using multiple lines.
    numbers.map((number) => {
        return (number * 2);
    });
```
