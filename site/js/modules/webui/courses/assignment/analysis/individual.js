import * as Autograder from '../../../../autograder/index.js';
import * as Core from '../../../core/index.js';
import * as Render from '../../../render/index.js';

function init() {
    Core.Routing.addRoute(/^course\/assignment\/analysis\/individual$/, handlerAnalysisIndividual, 'Assignment Individual Analysis', Core.Routing.NAV_COURSES, {assignment: true});
}

function handlerAnalysisIndividual(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Render.FieldType(context, 'submissions', 'List of Submission IDs', {
            type: '[]string',
            required: true,
        }),
        new Render.FieldType(context, 'wait', 'Wait for Completion', {
            type: Render.INPUT_TYPE_BOOL,
        }),
        new Render.FieldType(context, 'overwrite', 'Overwrite Records', {
            type: Render.INPUT_TYPE_BOOL,
        }),
        new Render.FieldType(context, 'dryRun', 'Dry Run', {
            type: Render.INPUT_TYPE_BOOL,
        }),
    ];

    Render.makePage(
            params, context, container, analysisIndividual,
            {
                header: 'Individual Analysis',
                description: 'Get the result of an individual analysis for the specified submissions.',
                inputs: inputFields,
                buttonName: 'Analyze',
                iconName: Render.ICON_NAME_ANALYSIS,
            },
        )
    ;
}

function analysisIndividual(params, context, container, inputParams) {
    return Autograder.Courses.Assignments.Submissions.Analysis.individual(
            inputParams.submissions, inputParams.overwrite,
            inputParams.wait, inputParams.dryRun,
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
