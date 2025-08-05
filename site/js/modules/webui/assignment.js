import * as Autograder from '../autograder/base.js'

import * as Input from './input.js'
import * as Log from './log.js'
import * as Render from './render.js'
import * as Routing from './routing.js'
import * as Util from './util.js'

function init() {
    let requirements = {assignment: true};
    Routing.addRoute(/^course\/assignment$/, handlerAssignment, 'Assignment', requirements);
    Routing.addRoute(/^course\/assignment\/peek$/, handlerPeek, 'Assignment Peek', requirements);
    Routing.addRoute(/^course\/assignment\/history$/, handlerHistory, 'Assignment History', requirements);
    Routing.addRoute(/^course\/assignment\/submit$/, handlerSubmit, 'Assignment Submit', requirements);
    Routing.addRoute(/^course\/assignment\/fetch\/course\/scores$/, handlerFetchCourseScores, 'Fetch Course Assignment Scores', requirements);
    Routing.addRoute(/^course\/assignment\/proxy-regrade$/, handlerProxyRegrade, 'Assignment Proxy Regrade', requirements);
    Routing.addRoute(/^course\/assignment\/proxy-resubmit$/, handlerProxyResubmit, 'Assignment Proxy Resubmit', requirements);
}

function setAssignmentTitle(course, assignment) {
    let args = {
        [Routing.PARAM_COURSE]: course.id,
        [Routing.PARAM_ASSIGNMENT]: assignment.id,
    };

    let courseLink = Routing.formHashPath(Routing.PATH_COURSE, {[Routing.PARAM_COURSE]: course.id});
    let assignmentLink = Routing.formHashPath(Routing.PATH_ASSIGNMENT, args);
    let titleParts = [
        [course.id, courseLink],
        [assignment.id, assignmentLink],
    ];

    Render.makeTitle(assignment.id, titleParts);
}

function handlerAssignment(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    setAssignmentTitle(course, assignment);

    let args = {
        [Routing.PARAM_COURSE]: course.id,
        [Routing.PARAM_ASSIGNMENT]: assignment.id,
    };

    let cards = [
        // Simple Actions
        Render.makeCardObject(
            'assignment-action',
            'Submit',
            Routing.formHashPath(Routing.PATH_SUBMIT, args),
        ),
        Render.makeCardObject(
            'assignment-action',
            'Peek a Previous Submission',
            Routing.formHashPath(Routing.PATH_PEEK, args),
        ),
        Render.makeCardObject(
            'assignment-action',
            'View Submission History',
            Routing.formHashPath(Routing.PATH_HISTORY, args),
        ),

        // Advanced Actions
        Render.makeCardObject(
            'assignment-action',
            'Fetch Course Scores',
            Routing.formHashPath(Routing.PATH_ASSIGNMENT_FETCH_COURSE_SCORES, args),
        ),
        Render.makeCardObject(
            'assignment-action',
            'Proxy Regrade',
            Routing.formHashPath(Routing.PATH_PROXY_REGRADE, args),
        ),
        Render.makeCardObject(
            'assignment-action',
            'Proxy Resubmit',
            Routing.formHashPath(Routing.PATH_PROXY_RESUBMIT, args),
        ),
    ];

    container.innerHTML = `
        <h2>${assignment.name}</h2>
        ${Render.cards(cards)}
    `;
}

function handlerPeek(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];
    let submission = params[Routing.PARAM_SUBMISSION] || '';

    setAssignmentTitle(course, assignment);

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

    setAssignmentTitle(course, assignment);

    Render.makePage(
            params, context, container, history,
            {
                header: 'Fetch Submission History',
                buttonName: 'Fetch',
            },
        )
    ;
}

function history(params, context, container, inputParams) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    return Autograder.Submissions.history(course.id, assignment.id)
        .then(function(result) {
            let html = "";

            if (!result['found-user']) {
                html = `<p>Could not find user: '${context.user.name}'.</p>`;
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

    setAssignmentTitle(course, assignment);

    container.innerHTML = `
        <div class='submit'>
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

    Routing.loadingStart(container);

    Autograder.Submissions.submit(course.id, assignment.id, files)
        .then(function(result) {
            container.innerHTML = getSubmissionResultHTML(course, assignment, result);
        })
        .catch(function(message) {
            container.innerHTML = Render.autograderError(message);
        })
    ;
}

function handlerFetchCourseScores(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    setAssignmentTitle(course, assignment);

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
            },
        )
    ;
}

function fetchCourseScores(params, context, container, inputParams) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    return Autograder.Submissions.fetchCourseScores(course.id, assignment.id, inputParams['target-users'])
        .then(function(result) {
            return `<pre><code data-lang="json">${JSON.stringify(result, null, 4)}</code></pre>`
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

    setAssignmentTitle(course, assignment);

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
            return `
                <pre><code class="code code-block" data-lang="json">${JSON.stringify(result, null, 4)}</code></pre>
            `;
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

    setAssignmentTitle(course, assignment);

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
    if (result.rejected) {
        return `
            <h3>Submission Rejected</h3>
            <p>${result.message}</p>
        `;
    } else if (!result['grading-success']) {
        return `
            <h3>Grading Failed</h3>
            <p>${result.message}</p>
        `;
    } else {
        return Render.submission(course, assignment, result.result);
    }
}

export {
    init,
}
