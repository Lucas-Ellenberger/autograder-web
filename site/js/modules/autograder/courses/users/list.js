import * as Core from '../../core.js';

function list(course, targetUsers = undefined) {
    return Core.sendRequest({
        endpoint: 'courses/users/list',
        payload: {
            'course-id': course,
            'target-users': targetUsers,
        },
    });
}

export {
    list,
};
