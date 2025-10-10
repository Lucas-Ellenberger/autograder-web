import * as Autograder from '../../autograder/index.js';
import * as Core from '../core/index.js';
import * as Render from '../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_SERVER_COURSES_LIST, handlerList, "Server Courses", Core.Routing.NAV_SERVER);
}

function handlerList(path, params, context, container) {
    Render.setTabTitle('Server Courses');

    Core.Routing.loadingStart(container, false);

    Autograder.Courses.list()
        .then(function(result) {
            let cards = [];

            for (const course of result.courses) {
                let link = Core.Routing.formHashPath(Core.Routing.PATH_COURSE, {[Core.Routing.PARAM_COURSE]: course.id});
                cards.push(new Render.Card(
                    'course',
                    course.name,
                    link,
                    {
                        minServerRole: Autograder.Common.SERVER_ROLE_USER,
                        minCourseRole: Autograder.Common.COURSE_ROLE_OTHER,
                        courseId: course.id,
                    },
                ));
            }

            let cardSections = [
                ['Server Courses', cards],
            ];

            container.innerHTML = Render.makeCardSections(context, '', cardSections);
        })
        .catch(function(message) {
            console.error(message);
            container.innerHTML = Render.autograderError(message);
        })
        .finally(function() {
            let eventDetails = {
                'path': path,
                'params': params,
                'context': context,
                'container': container,
            };
            Core.Event.dispatchEvent(Core.Event.EVENT_TYPE_NONTEMPLATE_LOAD_COMPLETE, eventDetails);
        })
    ;
}

init();
