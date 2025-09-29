import * as Core from '../../core.js'

function create(email, cleartext) {
    return Core.sendRequest({
        endpoint: 'users/tokens/create',
        overrideEmail: email,
        overrideCleartext: cleartext,
    });
}

export {
    create,
}
