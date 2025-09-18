import * as Core from '../../../../../core.js';

function peek(course, assignment, submission = undefined) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/fetch/user/peek',
        payload: {
            'course-id': course,
            'assignment-id': assignment,
            'target-submission': submission,
        },
    });
}

export {
    peek,
}
