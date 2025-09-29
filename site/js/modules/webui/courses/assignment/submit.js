import * as Autograder from '../../../autograder/index.js';
import * as Core from '../../core/index.js';
import * as Render from '../../render/index.js';
import * as Util from '../../util/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_SUBMIT, handlerSubmit, 'Assignment Submit', Core.Routing.NAV_COURSES, {assignment: true});
}

function handlerSubmit(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Render.FieldType(context, 'files', 'Files', {
            type: Render.INPUT_TYPE_FILE,
            required: true,
            placeholder: 'Submission Files',
            additionalAttributes: ' multiple="true"',
        }),
        new Render.FieldType(context, 'message', 'Message', {
            type: Render.INPUT_TYPE_STRING,
        }),
        new Render.FieldType(context, 'allowLate', 'Allow Late', {
            type: Render.INPUT_TYPE_BOOL,
        }),
    ];

    Render.makePage(
            params, context, container, doSubmit,
            {
                header: 'Submit Assignment',
                inputs: inputFields,
                buttonName: 'Submit',
                iconName: Render.ICON_NAME_SUBMIT,
            }
        )
    ;
}

function doSubmit(params, context, container, inputParams) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    return Autograder.Courses.Assignments.Submissions.submit(course.id, assignment.id, inputParams.files, inputParams.allowLate, inputParams.message)
        .then(function(result) {
            return getSubmissionResultHTML(course, assignment, result);
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

function getSubmissionResultHTML(course, assignment, result) {
    result.message = Util.messageTimestampsToPretty(result.message);

    if (result.rejected) {
        return getSubmissionErrorHTML('Submission Rejected', result);
    } else if (!result['grading-success']) {
        return getSubmissionErrorHTML('Grading Failed', result);
    } else {
        return Render.submission(course, assignment, result.result);
    }
}

function getSubmissionErrorHTML(header, submission) {
    return `
        <div class="submission">
            <div class="secondary-color drop-shadow">
                <h3>${header}</h3>
                <p>User ${submission['found-user'] ? '' : 'not '}found.</p>
                <p>Submission ${submission['found-submission'] ? '' : 'not '}found.</p>
                <p>${submission.message}</p>
            </div>
        </div>
    `;
}

init();

export {
    getSubmissionResultHTML,
};
