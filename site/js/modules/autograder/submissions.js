import * as Core from './core.js'

function history(course, assignment) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/fetch/user/history',
        payload: {
            'course-id': course,
            'assignment-id': assignment,
        },
    });
}

function peek(course, assignment, submission = undefined) {
    let args = {
        'course-id': course,
        'assignment-id': assignment,
    };

    if (submission) {
        args['target-submission'] = submission;
    }

    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/fetch/user/peek',
        payload: args,
    });
}

function submit(course, assignment, files) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/submit',
        files: files,
        payload: {
            'course-id': course,
            'assignment-id': assignment,
        },
    });
}

function proxyResubmit(args) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/proxy/resubmit',
        payload: args,
    });
}

export {
    history,
    peek,
    submit,
    proxyResubmit,
}
