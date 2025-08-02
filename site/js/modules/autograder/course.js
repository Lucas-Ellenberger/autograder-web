import * as Core from './core.js';

function email(params) {
    return Core.sendRequest({
        endpoint: 'courses/admin/email',
        payload: params,
    });
}

function users(params) {
    return Core.sendRequest({
        endpoint: 'courses/users/list',
        payload: params,
    });
}

export {
    email,
    users,
};
