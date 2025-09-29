import * as Autograder from '../../../autograder/index.js';
import * as Core from '../../core/index.js';
import * as Render from '../../render/index.js';

const COURSE_USER_REFERENCE_DOC_LINK = "https://github.com/edulinq/autograder-server/blob/main/docs/types.md#course-user-reference-courseuserreference";

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_EMAIL, handlerEmail, 'Email', Core.Routing.NAV_COURSES, {course: true});
}

function handlerEmail(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];

    Render.setTabTitle(course.id);

    let description = `
        Send an email to course users.
        Separate recipient values with commas.
        For valid recipient values reference
        this <a href="${COURSE_USER_REFERENCE_DOC_LINK}" target="_blank">documentation</a>.
    `;

    let inputFields = [
        new Render.FieldType(context, 'to', 'To', {
            extractInputFunc: extractRecipients,
        }),
        new Render.FieldType(context, 'cc', 'CC', {
            extractInputFunc: extractRecipients,
        }),
        new Render.FieldType(context, 'bcc', 'BCC', {
            extractInputFunc: extractRecipients,
        }),
        new Render.FieldType(context, 'subject', 'Subject', {
            required: true,
        }),
        new Render.FieldType(context, 'body', 'Content', {
            type: Render.INPUT_TYPE_TEXTAREA,
            additionalAttributes: 'rows="10"',
        }),
        new Render.FieldType(context, 'dryRun', 'Send as Dry Run', {
            type: Render.INPUT_TYPE_BOOL,
        }),
        new Render.FieldType(context, 'html', 'Content is HTML', {
            type: Render.INPUT_TYPE_BOOL,
        }),
    ];

    Render.makePage(
            params, context, container, sendEmail,
            {
                header: 'Email Users',
                description: description,
                inputs: inputFields,
                buttonName: 'Send Email',
                iconName: Render.ICON_NAME_MAIL,
            },
        )
    ;
}

function sendEmail(params, context, container, inputParams) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]].id;

    if ((inputParams.to?.length === 0) &&
            (inputParams.cc?.length === 0) &&
            (inputParams.bcc?.length === 0)) {
        return Promise.resolve('<p>Specify at least one recipient.</p>');
    }

    return Autograder.Courses.Admin.email(
            course, inputParams.dryRun, inputParams.html, inputParams.subject,
            inputParams.to, inputParams.cc, inputParams.bcc, inputParams.body,
    )
        .then(function(result) {
            return `
                <p>Email sent successfully.</p>
                ${Render.codeBlockJSON(result)}
            `;
        })
        .catch(function(message) {
            console.error(message);
            return Render.autograderError(message);
        })
    ;
}

function extractRecipients(input) {
    let recipientString = input.value;

    return recipientString
        .split(',')
        .map((recipient) => (recipient.trim()))
        .filter((recipient) => (recipient.length > 0))
    ;
}

init();
