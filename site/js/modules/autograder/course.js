import * as Core from './core.js';

function email(params) {
    return Core.sendRequest({
        endpoint: 'courses/admin/email',
        payload: params,
    });
}

function getUser(params) {
    return Core.sendRequest({
        endpoint: 'courses/users/get',
        payload: params,
    });
}

export {
    email,
    getUser,
};
