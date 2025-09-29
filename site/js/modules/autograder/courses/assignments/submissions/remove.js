import * as Core from '../../../core.js';

function remove(course, assignment, targetEmail = undefined, targetSubmission = undefined) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/remove',
        payload: {
            'course-id': course,
            'assignment-id': assignment,
            'target-email': targetEmail,
            'target-submission': targetSubmission,
        },
    });
}

export {
    remove,
}
