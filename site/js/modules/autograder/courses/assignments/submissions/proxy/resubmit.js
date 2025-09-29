import * as Core from '../../../../core.js';

function resubmit(course, assignment, proxyEmail, targetSubmission = undefined, proxyTime = undefined) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/proxy/resubmit',
        payload: {
            'course-id': course,
            'assignment-id': assignment,
            'proxy-email': proxyEmail,
            'proxy-time': proxyTime,
            'target-submission': targetSubmission,
        },
    });
}

export {
    resubmit,
}
