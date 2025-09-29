import * as Autograder from '../../autograder/index.js';
import * as Core from '../core/index.js';
import * as Render from '../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_COURSES, handlerCourses, 'Enrolled Courses', Core.Routing.NAV_COURSES);
}

function handlerCourses(path, params, context, container) {
    let cards = [];
    for (const [id, course] of Object.entries(context.user.enrollments)) {
        let link = Core.Routing.formHashPath(Core.Routing.PATH_COURSE, {[Core.Routing.PARAM_COURSE]: course.id});
        cards.push(new Render.Card(
            'course',
            course.name,
            link,
            {
                minServerRole: Autograder.Common.SERVER_ROLE_USER,
                minCourseRole: Autograder.Common.COURSE_ROLE_OTHER,
                courseId: id,
            },
        ));
    }

    let cardSections = [
        ['Enrolled Courses', cards],
    ];

    container.innerHTML = Render.makeCardSections(context, '', cardSections);
}

init();
