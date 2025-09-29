import * as Core from '../../core.js';

function email(course, dryRun, html, subject, to = undefined, cc = undefined, bcc = undefined, body = undefined) {
    return Core.sendRequest({
        endpoint: 'courses/admin/email',
        payload: {
            'course-id': course,
            'dry-run': dryRun,
            'html': html,
            'subject': subject,
            'to': to,
            'cc': cc,
            'bcc': bcc,
            'body': body,
        },
    });
}

export {
    email,
};
