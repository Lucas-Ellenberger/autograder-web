import * as Autograder from '../../../autograder/index.js';
import * as Core from '../../core/index.js';
import * as Render from '../../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_COURSE, handlerCourse, 'Course', Core.Routing.NAV_COURSES, {course: true});
}

function handlerCourse(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];

    Render.setTabTitle(course.id);

    let assignmentCards = [];
    for (const [id, assignment] of Object.entries(course.assignments)) {
        let args = {
            [Core.Routing.PARAM_COURSE]: course.id,
            [Core.Routing.PARAM_ASSIGNMENT]: assignment.id,
        };

        let link = Core.Routing.formHashPath(Core.Routing.PATH_ASSIGNMENT, args);
        assignmentCards.push(new Render.Card(
            'assignment',
            assignment.name,
            link,
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_OTHER,
                courseId: course.id,
            },
        ));
    }

    let actionCards = [];
    actionCards.push(new Render.Card(
        "course-action",
        "Email Users",
        Core.Routing.formHashPath(Core.Routing.PATH_EMAIL, {
            [Core.Routing.PARAM_COURSE]: course.id,
        }),
        {
            minServerRole: Autograder.Common.SERVER_ROLE_USER,
            minCourseRole: Autograder.Common.COURSE_ROLE_GRADER,
            courseId: course.id,
        },
    ));

    actionCards.push(new Render.Card(
        "course-action",
        "List Users",
        Core.Routing.formHashPath(Core.Routing.PATH_COURSE_USERS_LIST, {
            [Core.Routing.PARAM_COURSE]: course.id,
        }),
        {
            minServerRole: Autograder.Common.SERVER_ROLE_USER,
            minCourseRole: Autograder.Common.COURSE_ROLE_GRADER,
            courseId: course.id,
        },
    ));

     actionCards.push(new Render.Card(
        "course-action",
        "Update Course",
        Core.Routing.formHashPath(Core.Routing.PATH_COURSE_UPDATE, {
            [Core.Routing.PARAM_COURSE]: course.id,
        }),
        {
            minServerRole: Autograder.Common.SERVER_ROLE_USER,
            minCourseRole: Autograder.Common.COURSE_ROLE_ADMIN,
            courseId: course.id,
        },
    ));

    let cardSections = [
        ['Assignments', assignmentCards],
        ['Actions', actionCards],
    ];

    container.innerHTML = Render.makeCardSections(context, course.name, cardSections, Render.ICON_NAME_COURSES);
}

init();
