import * as Core from '../core.js'

function list() {
    return Core.sendRequest({
        endpoint: 'courses/list',
        payload: {},
    });
}

export {
    list,
}
