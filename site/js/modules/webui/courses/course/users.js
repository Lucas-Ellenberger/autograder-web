import * as Autograder from '../../../autograder/index.js';
import * as Core from '../../core/index.js';
import * as Render from '../../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_COURSE_USERS_LIST, handlerUsers, 'Users', Core.Routing.NAV_COURSES, {course: true});
}

function handlerUsers(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];

    Render.setTabTitle(course.id);

    let inputFields = [
        new Render.FieldType(context, 'targetUsers', 'Target Users', {
            type: Render.COURSE_USER_REFERENCE_LIST_FIELD_TYPE,
        }),
    ];

    let description = `
        List the users in the course (defaults to all users).
    `;

    Render.makePage(
            params, context, container, listUsers,
            {
                header: 'List Users',
                description: description,
                inputs: inputFields,
                buttonName: 'List Users',
                iconName: Render.ICON_NAME_LIST,
            },
        )
    ;
}

function listUsers(params, context, container, inputParams) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]].id;

    return Autograder.Courses.Users.list(course, inputParams.targetUsers)
        .then(function(result) {
            if (result.users.length === 0) {
                return '<p>Unable to find target users.</p>';
            }

            Render.apiOutputSwitcher(result.users, container, {
                renderOptions: new Render.APIValueRenderOptions({
                    keyOrdering: ['email', 'name', 'role', 'lms-id'],
                    initialIndentLevel: -1,
                }),
                modes: [
                    Render.API_OUTPUT_SWITCHER_TEXT,
                    Render.API_OUTPUT_SWITCHER_TABLE,
                    Render.API_OUTPUT_SWITCHER_JSON,
                ],
            });

            return undefined;
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

init();
