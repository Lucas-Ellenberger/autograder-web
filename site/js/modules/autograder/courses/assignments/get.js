import * as Core from '../../core.js'

function get(courseID, assignmentID) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/get',
        payload: {
            'course-id': courseID,
            'assignment-id': assignmentID,
        },
    });
}

export {
    get,
}
