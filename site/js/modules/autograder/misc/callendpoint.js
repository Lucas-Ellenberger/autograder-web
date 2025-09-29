import * as Core from '../core.js'

function callEndpoint({
        targetEndpoint, params,
        overrideEmail = undefined, overrideCleartext = undefined,
        clearContextUser = true,
        }) {
    return Core.sendRequest({
        endpoint: targetEndpoint,
        payload: params,
        overrideEmail: overrideEmail,
        overrideCleartext: overrideCleartext,
        clearContextUser: clearContextUser,
    });
}

export {
    callEndpoint,
}
