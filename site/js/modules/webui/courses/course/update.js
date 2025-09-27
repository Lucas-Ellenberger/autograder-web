import * as Autograder from '../../../autograder/index.js';
import * as Core from '../../core/index.js';
import * as Render from '../../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_COURSE_UPDATE, handlerUpdate, 'Update Course', Core.Routing.NAV_COURSES, {course: true});
}

function handlerUpdate(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];

    Render.setTabTitle(course.id);

    Render.makePage(
            params, context, container, updateCourse,
            {
                header: 'Update Course',
                description: 'Update an existing course.',
                inputs: [],
                buttonName: 'Update',
            },
        )
    ;
}

function updateCourse(params, context, container, inputParams) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];

    return Autograder.Courses.Admin.update(course.id)
        .then(function(result) {
            return Render.codeBlockJSON(result);
        })
        .catch(function(message) {
            console.error(message);
            return Render.autograderError(message);
        })
    ;
}

init();
