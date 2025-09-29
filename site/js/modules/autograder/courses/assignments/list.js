import * as Core from '../../core.js'

function list(courseID) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/list',
        payload: {
            'course-id': courseID
        },
    });
}

export {
    list,
}
