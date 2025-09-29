import * as Autograder from '../../../../autograder/index.js';
import * as Core from '../../../core/index.js';
import * as Render from '../../../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_ASSIGNMENT_FETCH_COURSE_SCORES, handlerFetchCourseScores, 'Fetch Course Assignment Scores', Core.Routing.NAV_COURSES, {assignment: true});
}

function handlerFetchCourseScores(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Render.FieldType(context, 'target-users', 'Target Users', {
            type: '[]model.CourseUserReference',
        }),
    ];

    Render.makePage(
            params, context, container, fetchCourseScores,
            {
                header: 'Fetch Course Scores',
                description: 'Fetch the most recent scores for this assignment.',
                inputs: inputFields,
                buttonName: 'Fetch',
                iconName: Render.ICON_NAME_FETCH,
            },
        )
    ;
}

function fetchCourseScores(params, context, container, inputParams) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    return Autograder.Courses.Assignments.Submissions.Fetch.Course.scores(course.id, assignment.id, inputParams['target-users'])
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
