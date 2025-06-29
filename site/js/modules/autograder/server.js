import * as Core from './core.js'

let apiDescription = undefined;

function callEndpoint({
        targetEndpoint, params,
        override_email = undefined, override_cleartext = undefined,
        clearContextUser = true,
        }) {
    return Core.sendRequest({
        endpoint: targetEndpoint,
        payload: params,
        override_email: override_email,
        override_cleartext: override_cleartext,
        clearContextUser: clearContextUser,
    });
}

function describe() {
    if (apiDescription) {
        return Promise.resolve(apiDescription);
    }

    let promise = Core.sendRequest({
        endpoint: 'metadata/describe',
    });

    return promise
        .then(function(result) {
            apiDescription = result;
            return result;
        })
    ;
}

export {
    callEndpoint,
    describe,
}
