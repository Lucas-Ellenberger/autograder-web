import * as Core from '../../../core/index.js';
import * as History from '../history.js';
import * as Render from '../../../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_USER_HISTORY, handlerUserHistory, 'User Assignment History', Core.Routing.NAV_COURSES, {assignment: true});
}

function handlerUserHistory(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Render.FieldType(context, 'targetUser', 'Target User', {
            type: 'core.TargetCourseUserSelfOrGrader',
            placeholder: context.user.email,
        }),
    ];

    Render.makePage(
            params, context, container, History.historyCallback,
            {
                header: 'Fetch User Submission History',
                description: 'Fetch a summary of the submissions for this assignment.',
                inputs: inputFields,
                buttonName: 'Fetch',
                iconName: Render.ICON_NAME_HISTORY,
            },
        )
    ;
}

init();
