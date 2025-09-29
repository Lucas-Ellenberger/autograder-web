import * as Autograder from '../../../../autograder/index.js';
import * as Core from '../../../core/index.js';
import * as Render from '../../../render/index.js';
import * as Submit from '../submit.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_PROXY_RESUBMIT, handlerProxyResubmit, 'Assignment Proxy Resubmit', Core.Routing.NAV_COURSES, {assignment: true});
}

function handlerProxyResubmit(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Render.FieldType(context, 'email', 'Target User', {
            type: Render.INPUT_TYPE_EMAIL,
            required: true,
            placeholder: 'Email',
        }),
        new Render.FieldType(context, 'time', 'Proxy Time', {
            type: Render.INPUT_TYPE_INT,
        }),
        new Render.FieldType(context, 'submission', 'Submission', {
            placeholder: 'Most Recent',
        }),
    ];

    Render.makePage(
            params, context, container, proxyResubmit,
            {
                header: 'Proxy Resubmit',
                description: 'Proxy resubmit an assignment submission to the autograder.',
                inputs: inputFields,
                buttonName: 'Resubmit',
                iconName: Render.ICON_NAME_PROXY_RESUBMIT,
            },
        )
    ;
}

function proxyResubmit(params, context, container, inputParams) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    return Autograder.Courses.Assignments.Submissions.Proxy.resubmit(
            course.id, assignment.id,
            inputParams.email, inputParams.submission, inputParams.time,
        )
        .then(function(result) {
            return Submit.getSubmissionResultHTML(course, assignment, result);
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

init();
