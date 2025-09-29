import * as Autograder from '../../../../autograder/index.js';

import * as Core from '../../../core/index.js';
import * as Render from '../../../render/index.js';
import * as Util from '../../../util/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_ASSIGNMENT_FETCH_USER_ATTEMPT, handlerFetchUserAttempt, 'Fetch Submission Attempt', Core.Routing.NAV_COURSES, {assignment: true});
}

function handlerFetchUserAttempt(path, params, context, container) {
    let course = context.courses[params[Core.Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Core.Routing.PARAM_ASSIGNMENT]];
    let userEmail = context.user.email;

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Render.FieldType(context, 'targetEmail', 'Target User Email', {
            type: 'core.TargetCourseUserSelfOrGrader',
            placeholder: userEmail,
        }),
        new Render.FieldType(context, 'targetSubmission', 'Target Submission ID', {
            type: Render.INPUT_TYPE_STRING,
            placeholder: '< Most Recent >',
        }),
    ];

    // Keep track of the result for future downloading.
    let _cached_result = undefined;

    let fetchUserAttempt = function(params, context, container, inputParams) {
        return Autograder.Courses.Assignments.Submissions.Fetch.User.attempt(course.id, assignment.id, inputParams.targetEmail, inputParams.targetSubmission)
            .then(function(result) {
                if (!result['found-submission']) {
                    return Render.codeBlockJSON(result);
                }

                // Stash the result for later use.
                _cached_result = result;

                return `
                    <div class='results-controls'>
                        <button class='download' disabled>Download Results</button>
                    </div>
                    <hr />
                    <div>
                        ${Render.codeBlockJSON(result)}
                    </div>
                `;
            })
            .catch(function(message) {
                console.error(message);
                return message;
            })
        ;
    }

    // After the results are rendered, enable the download button.
    let postResultsFunc = function(params, context, container, inputParams, resultHTML) {
        let button = container.querySelector('.results-controls button.download');
        if (!button) {
            return;
        }

        button.addEventListener("click", function(event) {
            // Disable the button again to avoid multiple downloads.
            button.disabled = true;

            // Bail if there are no results.
            if (!_cached_result) {
                return;
            }

            // Convert the results to a zip.
            Autograder.Util.autograderGradingResultToJSFile(_cached_result['grading-result']).then(function(file) {
                // Download the zip.
                Util.downloadFile(file);

                // Re-enable the button.
                button.disabled = false;
            });
        });

        // Enable the button.
        button.disabled = false;
    };

    Render.makePage(
            params, context, container, fetchUserAttempt,
            {
                header: 'Fetch Submission Attempt',
                description: 'Fetch a full submission attempt.',
                inputs: inputFields,
                buttonName: 'Fetch',
                iconName: Render.ICON_NAME_FETCH,
                postResultsFunc: postResultsFunc,
            },
        )
    ;
}

init();
