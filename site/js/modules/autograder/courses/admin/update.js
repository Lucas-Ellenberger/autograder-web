import * as Core from '../../core.js';

function update(course) {
    return Core.sendRequest({
        endpoint: 'courses/admin/update',
        payload: {
            'course-id': course,
        },
    });
}

export {
    update,
};
