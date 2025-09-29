import * as Core from '../core.js'

function get() {
    return Core.sendRequest({
        endpoint: 'users/get',
    });
}

export {
    get,
}
