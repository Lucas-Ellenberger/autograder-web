import * as Autograder from '../../../../autograder/index.js';
import * as Core from '../../../core/index.js';
import * as Render from '../../../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_PROXY_REGRADE, handlerProxyRegrade, 'Assignment Proxy Regrade', Core.Routing.NAV_COURSES, {assignment: true});
}

function handlerProxyRegrade(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Render.FieldType(context, 'dryRun', 'Dry Run', {
            type: Render.INPUT_TYPE_BOOL,
        }),
        new Render.FieldType(context, 'overwrite', 'Overwrite Records', {
            type: Render.INPUT_TYPE_BOOL,
        }),
        new Render.FieldType(context, 'cutoff', 'Regrade Cutoff', {
            type: Render.INPUT_TYPE_INT,
        }),
        new Render.FieldType(context, 'users', 'Target Users', {
            type: Render.COURSE_USER_REFERENCE_LIST_FIELD_TYPE,
            placeholder: '< All Users in Course >',
        }),
        new Render.FieldType(context, 'wait', 'Wait for Completion', {
            type: Render.INPUT_TYPE_BOOL,
        })
    ];

    Render.makePage(
            params, context, container, proxyRegrade,
            {
                header: 'Proxy Regrade',
                description: 'Proxy regrade an assignment for all target users using their most recent submission.',
                inputs: inputFields,
                buttonName: 'Regrade',
                iconName: Render.ICON_NAME_PROXY_REGRADE,
            },
        )
    ;
}

function proxyRegrade(params, context, container, inputParams) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    return Autograder.Courses.Assignments.Submissions.Proxy.regrade(
            course.id, assignment.id,
            inputParams.dryRun, inputParams.overwrite, inputParams.wait,
            inputParams.cutoff, inputParams.users,
        )
        .then(function(result) {
            return Render.codeBlockJSON(result);
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

init();
