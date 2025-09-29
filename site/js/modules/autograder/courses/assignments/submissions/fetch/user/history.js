import * as Core from '../../../../../core.js';

function history(course, assignment, targetEmail = undefined) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/fetch/user/history',
        payload: {
            'course-id': course,
            'assignment-id': assignment,
            'target-email': targetEmail,
        },
    });
}

export {
    history,
}
