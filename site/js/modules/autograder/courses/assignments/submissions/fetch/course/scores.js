import * as Core from '../../../../../core.js';

function scores(course, assignment, targetUsers = undefined) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/fetch/course/scores',
        payload: {
            'course-id': course,
            'assignment-id': assignment,
            'target-users': targetUsers,
        },
    });
}

export {
    scores,
}
