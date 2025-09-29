import * as Core from '../../../../../core.js';

function attempt(course, assignment, targetEmail = undefined, targetSubmission = undefined) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/fetch/user/attempt',
        payload: {
            'course-id': course,
            'assignment-id': assignment,
            'target-email': targetEmail,
            'target-submission': targetSubmission,
        },
    });
}

export {
    attempt,
}
