import * as Core from '../../../core.js';

function submit(course, assignment, files, allowLate, message = undefined) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/submit',
        files: files,
        payload: {
            'course-id': course,
            'assignment-id': assignment,
            'allow-late': allowLate,
            'message': message,
        },
    });
}

export {
    submit,
}
