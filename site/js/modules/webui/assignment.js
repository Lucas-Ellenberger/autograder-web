import * as Autograder from '../autograder/base.js'

import * as Icon from './icon.js'
import * as Input from './input.js'
import * as Log from './log.js'
import * as Render from './render.js'
import * as Routing from './routing.js'
import * as Util from './util.js'

function init() {
    let requirements = {assignment: true};
    Routing.addRoute(/^course\/assignment$/, handlerAssignment, 'Assignment', Routing.NAV_PARENT_COURSES, requirements);
    Routing.addRoute(/^course\/assignment\/peek$/, handlerPeek, 'Assignment Peek', Routing.NAV_PARENT_COURSES, requirements);
    Routing.addRoute(/^course\/assignment\/history$/, handlerHistory, 'Assignment History', Routing.NAV_PARENT_COURSES, requirements);
    Routing.addRoute(/^course\/assignment\/submit$/, handlerSubmit, 'Assignment Submit', Routing.NAV_PARENT_COURSES, requirements);
    Routing.addRoute(/^course\/assignment\/remove$/, handlerSubmissionRemove, 'Remove Submission', Routing.NAV_PARENT_COURSES, requirements);
    Routing.addRoute(/^course\/assignment\/fetch\/course\/scores$/, handlerFetchCourseScores, 'Fetch Course Assignment Scores', Routing.NAV_PARENT_COURSES, requirements);
    Routing.addRoute(/^course\/assignment\/proxy-regrade$/, handlerProxyRegrade, 'Assignment Proxy Regrade', Routing.NAV_PARENT_COURSES, requirements);
    Routing.addRoute(/^course\/assignment\/proxy-resubmit$/, handlerProxyResubmit, 'Assignment Proxy Resubmit', Routing.NAV_PARENT_COURSES, requirements);
    Routing.addRoute(/^course\/assignment\/analysis\/individual$/, handlerAnalysisIndividual, 'Assignment Individual Analysis', Routing.NAV_PARENT_COURSES, requirements);
    Routing.addRoute(/^course\/assignment\/analysis\/pairwise$/, handlerAnalysisPairwise, 'Assignment Pairwise Analysis', Routing.NAV_PARENT_COURSES, requirements);
    Routing.addRoute(/^course\/assignment\/user\/history$/, handlerUserHistory, 'User Assignment History', Routing.NAV_PARENT_COURSES, requirements);
}

function handlerAssignment(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let args = {
        [Routing.PARAM_COURSE]: course.id,
        [Routing.PARAM_ASSIGNMENT]: assignment.id,
    };

    // Simple Actions
    let studentCards = [
        new Render.Card(
            'assignment-action',
            'Submit',
            Routing.formHashPath(Routing.PATH_SUBMIT, args),
            {
                minServerRole: Autograder.Users.SERVER_ROLE_USER,
                minCourseRole: Autograder.Users.COURSE_ROLE_STUDENT,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Peek a Previous Submission',
            Routing.formHashPath(Routing.PATH_PEEK, args),
            {
                minServerRole: Autograder.Users.SERVER_ROLE_USER,
                minCourseRole: Autograder.Users.COURSE_ROLE_STUDENT,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'View Submission History',
            Routing.formHashPath(Routing.PATH_HISTORY, args),
            {
                minServerRole: Autograder.Users.SERVER_ROLE_USER,
                minCourseRole: Autograder.Users.COURSE_ROLE_STUDENT,
                courseId: course.id,
            },
        ),
    ];

    // Advanced Actions
    let staffCards = [
        new Render.Card(
            'assignment-action',
            'Fetch Course Scores',
            Routing.formHashPath(Routing.PATH_ASSIGNMENT_FETCH_COURSE_SCORES, args),
            {
                minServerRole: Autograder.Users.SERVER_ROLE_USER,
                minCourseRole: Autograder.Users.COURSE_ROLE_GRADER,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Proxy Regrade',
            Routing.formHashPath(Routing.PATH_PROXY_REGRADE, args),
            {
                minServerRole: Autograder.Users.SERVER_ROLE_USER,
                minCourseRole: Autograder.Users.COURSE_ROLE_GRADER,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Proxy Resubmit',
            Routing.formHashPath(Routing.PATH_PROXY_RESUBMIT, args),
            {
                minServerRole: Autograder.Users.SERVER_ROLE_USER,
                minCourseRole: Autograder.Users.COURSE_ROLE_GRADER,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Individual Analysis',
            Routing.formHashPath(Routing.PATH_ANALYSIS_INDIVIDUAL, args),
            {
                minServerRole: Autograder.Users.SERVER_ROLE_USER,
                minCourseRole: Autograder.Users.COURSE_ROLE_ADMIN,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Pairwise Analysis',
            Routing.formHashPath(Routing.PATH_ANALYSIS_PAIRWISE, args),
            {
                minServerRole: Autograder.Users.SERVER_ROLE_USER,
                minCourseRole: Autograder.Users.COURSE_ROLE_ADMIN,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'Remove Submission',
            Routing.formHashPath(Routing.PATH_SUBMIT_REMOVE, args),
            {
                minServerRole: Autograder.Users.SERVER_ROLE_USER,
                minCourseRole: Autograder.Users.COURSE_ROLE_GRADER,
                courseId: course.id,
            },
        ),
        new Render.Card(
            'assignment-action',
            'View User History',
            Routing.formHashPath(Routing.PATH_USER_HISTORY, args),
            {
                minServerRole: Autograder.Users.SERVER_ROLE_USER,
                minCourseRole: Autograder.Users.COURSE_ROLE_GRADER,
                courseId: course.id,
            },
        ),
    ];

    let cardSections = [
        ['Student Actions', studentCards],
        ['Course Staff Actions', staffCards],
    ];

    container.innerHTML = Render.makeCardSections(context, assignment.name, cardSections, Icon.ICON_NAME_COURSES);
}

function handlerPeek(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];
    let submission = params[Routing.PARAM_SUBMISSION] || '';

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Input.FieldType(context, 'submission', 'Submission ID', {
            defaultValue: submission,
        }),
    ];

    Render.makePage(
            params, context, container, peek,
            {
                header: 'Peek a Submission',
                description: 'View a past submission. If no submission ID is provided, the most recent submission is used.',
                inputs: inputFields,
                buttonName: 'Peek',
                iconName: Icon.ICON_NAME_PEEK,
                // Auto-submit if we were passed an existing submission ID.
                submitOnCreation: (submission != ''),
            },
        )
    ;
}

function peek(params, context, container, inputParams) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    return Autograder.Submissions.peek(course.id, assignment.id, inputParams.submission)
        .then(function(result) {
            let html = "";

            if (!result['found-user']) {
                html = `<p>Could not find user: '${context.user.name}'.</p>`;
            } else if (!result['found-submission']) {
                if (inputParams.submission) {
                    html = `<p>Could not find submission: '${inputParams.submission}'.</p>`;
                } else {
                    html = `<p>Could not find most recent submission.</p>`;
                }
            } else {
                html = Render.submission(course, assignment, result['submission-result']);
            }

            return html;
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

function handlerHistory(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    Render.makePage(
            params, context, container, history,
            {
                header: 'Fetch Submission History',
                buttonName: 'Fetch',
                iconName: Icon.ICON_NAME_HISTORY,
            },
        )
    ;
}

function handlerUserHistory(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Input.FieldType(context, 'targetUser', 'Target User', {
            type: 'core.TargetCourseUserSelfOrGrader',
            placeholder: context.user.email,
        }),
    ];

    Render.makePage(
            params, context, container, history,
            {
                header: 'Fetch User Submission History',
                description: 'Fetch a summary of the submissions for this assignment.',
                inputs: inputFields,
                buttonName: 'Fetch',
                iconName: Icon.ICON_NAME_HISTORY,
            },
        )
    ;
}

function history(params, context, container, inputParams) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    let targetEmail = inputParams.targetUser ?? context.user.email;

    return Autograder.Submissions.history(course.id, assignment.id, targetEmail)
        .then(function(result) {
            let html = "";

            if (!result['found-user']) {
                html = `<p>Could not find user: '${targetEmail}'.</p>`;
            } else {
                html = Render.submissionHistory(course, assignment, result['history']);
            }

            return html;
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

function handlerSubmit(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    container.innerHTML = `
        <div class='submit-page'>
            <div class='submit-content'>
                <div class='submit-controls page-controls'>
                    <button disabled>Submit</button>
                    <div>
                        <label for='files'>Files:</label>
                        <input type='file' multiple='true' name='files' placeholder='Submission Files' />
                    </div>
                </div>
                <div class='submit-results'>
                </div>
            </div>
        </div>
    `;

    let button = container.querySelector('.submit-controls button');
    let input = container.querySelector('.submit-controls input');
    let results = container.querySelector('.submit-results');

    // Enable the button if there are files.
    input.addEventListener('change', function(event) {
        if (input.files) {
            button.disabled = false;
        } else {
            button.disabled = true;
        }
    });

    button.addEventListener('click', function() {
        doSubmit(context, course, assignment, input.files, results);
    });
}

function doSubmit(context, course, assignment, files, container) {
    if (files.length < 1) {
        container.innerHTML = `
            <p>No submission files provided.</p>
        `;
        return;
    }

    Routing.loadingStart(container, false);

    Autograder.Submissions.submit(course.id, assignment.id, files)
        .then(function(result) {
            container.innerHTML = getSubmissionResultHTML(course, assignment, result);
        })
        .catch(function(message) {
            container.innerHTML = Render.autograderError(message);
        })
    ;
}

function handlerSubmissionRemove(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];
    let userEmail = context.user.email;

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Input.FieldType(context, 'targetEmail', 'Target User Email', {
            type: 'core.TargetCourseUserSelfOrGrader',
            placeholder: userEmail,
        }),
        new Input.FieldType(context, 'targetSubmission', 'Target Submission ID', {
            type: Input.INPUT_TYPE_STRING,
        }),
    ];

    Render.makePage(
            params, context, container, removeSubmission, {
                header: 'Remove Assignment Submission',
                description: 'Remove a specified submission. Defaults to the most recent submission.',
                inputs: inputFields,
                buttonName: 'Remove Submission',
                // TODO: Need the remove icon.
                iconName: Icon.ICON_NAME_SUBMIT,
            }
        )
    ;
}

function removeSubmission(params, context, container, inputParams) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    return Autograder.Submissions.remove(
            course.id, assignment.id,
            inputParams.targetEmail, inputParams.targetSubmission,
        )
        .then(function(result) {
            let html = "";

            if (!result['found-user']) {
                html = `<p>Could not find user.</p>`;
            } else if (!result['found-submission']) {
                html = `<p>Could not find submission.</p>`;
            } else {
                html = `<p>Submission removed successfully.</p>`;
            }

            return html;
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

function handlerFetchCourseScores(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Input.FieldType(context, 'target-users', 'Target Users', {
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
                iconName: Icon.ICON_NAME_FETCH,
            },
        )
    ;
}

function fetchCourseScores(params, context, container, inputParams) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    return Autograder.Submissions.fetchCourseScores(course.id, assignment.id, inputParams['target-users'])
        .then(function(result) {
            return Render.displayJSON(result);
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

function handlerProxyRegrade(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Input.FieldType(context, 'dryRun', 'Dry Run', {
            type: Input.INPUT_TYPE_BOOL,
        }),
        new Input.FieldType(context, 'overwrite', 'Overwrite Records', {
            type: Input.INPUT_TYPE_BOOL,
        }),
        new Input.FieldType(context, 'cutoff', 'Regrade Cutoff', {
            type: Input.INPUT_TYPE_INT,
        }),
        new Input.FieldType(context, 'users', 'Target Users', {
            type: Input.COURSE_USER_REFERENCE_LIST_FIELD_TYPE,
            required: true,
        }),
        new Input.FieldType(context, 'wait', 'Wait for Completion', {
            type: Input.INPUT_TYPE_BOOL,
        })
    ];

    Render.makePage(
            params, context, container, proxyRegrade,
            {
                header: 'Proxy Regrade',
                description: 'Proxy regrade an assignment for all target users using their most recent submission.',
                inputs: inputFields,
                buttonName: 'Regrade',
                iconName: Icon.ICON_NAME_PROXY_REGRADE,
            },
        )
    ;
}

function proxyRegrade(params, context, container, inputParams) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    return Autograder.Submissions.proxyRegrade(
            course.id, assignment.id,
            inputParams.dryRun, inputParams.overwrite,
            inputParams.cutoff, inputParams.target, inputParams.wait
        )
        .then(function(result) {
            return Render.displayJSON(result);
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

function handlerProxyResubmit(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Input.FieldType(context, 'email', 'Target User', {
            type: Input.INPUT_TYPE_EMAIL,
            required: true,
            placeholder: 'Email',
        }),
        new Input.FieldType(context, 'time', 'Proxy Time', {
            type: Input.INPUT_TYPE_INT,
        }),
        new Input.FieldType(context, 'submission', 'Submission', {
            placeholder: 'Most Recent',
        })
    ];

    Render.makePage(
            params, context, container, proxyResubmit,
            {
                header: 'Proxy Resubmit',
                description: 'Proxy resubmit an assignment submission to the autograder.',
                inputs: inputFields,
                buttonName: 'Resubmit',
                iconName: Icon.ICON_NAME_PROXY_RESUBMIT,
            },
        )
    ;
}

function proxyResubmit(params, context, container, inputParams) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    return Autograder.Submissions.proxyResubmit(
            course.id, assignment.id,
            inputParams.email, inputParams.time,
            inputParams.submission
        )
        .then(function(result) {
            return getSubmissionResultHTML(course, assignment, result);
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

function getSubmissionResultHTML(course, assignment, result) {
    result.message = processMessage(result.message);

    if (result.rejected) {
        return `
            <h3>Submission Rejected</h3>
            <p><pre>${result.message}</pre></p>
        `;
    } else if (!result['grading-success']) {
        return `
            <h3>Grading Failed</h3>
            <p><pre>${result.message}</pre></p>
        `;
    } else {
        return Render.submission(course, assignment, result.result);
    }
}

function processMessage(message) {
    return message.replace(/<timestamp:(\d+)>/g, function(match, timestamp) {
        return Util.timestampToPretty(parseInt(timestamp))
    });
}

function handlerAnalysisIndividual(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Input.FieldType(context, 'submissions', 'List of Submission IDs', {
            type: '[]string',
            required: true,
        }),
        new Input.FieldType(context, 'wait', 'Wait for Completion', {
            type: Input.INPUT_TYPE_BOOL,
        }),
        new Input.FieldType(context, 'overwrite', 'Overwrite Records', {
            type: Input.INPUT_TYPE_BOOL,
        }),
        new Input.FieldType(context, 'dryRun', 'Dry Run', {
            type: Input.INPUT_TYPE_BOOL,
        }),
    ];

    Render.makePage(
            params, context, container, analysisIndividual,
            {
                header: 'Individual Analysis',
                description: 'Get the result of an individual analysis for the specified submissions.',
                inputs: inputFields,
                buttonName: 'Analyze',
                iconName: Icon.ICON_NAME_ANALYSIS,
            },
        )
    ;
}

function analysisIndividual(params, context, container, inputParams) {
    return Autograder.Submissions.analysisIndividual(
            inputParams.submissions, inputParams.overwrite,
            inputParams.wait, inputParams.dryRun,
        )
        .then(function(result) {
            return Render.displayJSON(result);
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

function handlerAnalysisPairwise(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    Render.setTabTitle(assignment.id);

    let inputFields = [
        new Input.FieldType(context, 'submissions', 'List of Submission IDs', {
            type: '[]string',
            required: true,
        }),
        new Input.FieldType(context, 'wait', 'Wait for Completion', {
            type: Input.INPUT_TYPE_BOOL,
        }),
        new Input.FieldType(context, 'overwrite', 'Overwrite Records', {
            type: Input.INPUT_TYPE_BOOL,
        }),
        new Input.FieldType(context, 'dryRun', 'Dry Run', {
            type: Input.INPUT_TYPE_BOOL,
        }),
    ];

    Render.makePage(
            params, context, container, analysisPairwise,
            {
                header: 'Pairwise Analysis',
                description: 'Get the result of a pairwise analysis for the specified submissions.',
                inputs: inputFields,
                buttonName: 'Analyze',
                iconName: Icon.ICON_NAME_ANALYSIS,
            },
        )
    ;
}

function analysisPairwise(params, context, container, inputParams) {
    return Autograder.Submissions.analysisPairwise(
            inputParams.submissions, inputParams.overwrite,
            inputParams.wait, inputParams.dryRun,
        )
        .then(function(result) {
            return Render.displayJSON(result);
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

export {
    init,
}
