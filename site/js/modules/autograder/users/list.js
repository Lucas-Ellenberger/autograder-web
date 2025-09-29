import * as Core from '../core.js'

function list(targetUsers) {
    return Core.sendRequest({
        endpoint: 'users/list',
        payload: {
            'target-users': targetUsers,
        }
    });
}

export {
    list,
}
