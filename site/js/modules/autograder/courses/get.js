import * as Core from '../core.js';

function get(course) {
    return Core.sendRequest({
        endpoint: 'courses/get',
        payload: {
            'course-id': course,
        },
    });
}

export {
    get,
};
