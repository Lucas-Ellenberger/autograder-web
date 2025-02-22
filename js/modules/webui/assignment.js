import * as Autograder from '../autograder/base.js'

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
}

function handlerAssignment(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    Routing.setTitle(assignment.name);

    let args = {
        [Routing.PARAM_COURSE]: course.id,
        [Routing.PARAM_ASSIGNMENT]: assignment.id,
    };

    let cards = [
        Render.makeCardObject('assignment-action', 'Submit', Routing.formHashPath(Routing.PATH_SUBMIT, args)),
        Render.makeCardObject('assignment-action', 'Peek a Previous Submission', Routing.formHashPath(Routing.PATH_PEEK, args)),
        Render.makeCardObject('assignment-action', 'View Submission History', Routing.formHashPath(Routing.PATH_HISTORY, args)),
    ];

    container.innerHTML = `
        <h2>${assignment.name}</h2>
        ${Render.cards(cards)}
    `;
}

function handlerPeek(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];
    let submission = params[Routing.PARAM_SUBMISSION] || undefined;

    container.innerHTML = `
        <div class='peek'>
            <div class='peek-controls page-controls'>
                <button>Peek</button>
                <div>
                    <label>Submission ID:</label>
                    <input type='text' placeholder='Most Recent'>
                </div>
            </div>
            <div class='peek-results'>
            </div>
        </div>
    `;

    let button = container.querySelector('.peek-controls button');
    let input = container.querySelector('.peek-controls input');
    let results = container.querySelector('.peek-results');

    if (submission) {
        input.value = submission;
    }

    button.addEventListener('click', function(event) {
        params[Routing.PARAM_SUBMISSION] = input.value || undefined;

        let path = Routing.formHashPath(Routing.PATH_PEEK, params);
        Routing.redirect(path);
    });

    doPeek(context, course, assignment, results, submission);
}

function doPeek(context, course, assignment, container, submission) {
    Routing.loadingStart(container);

    Autograder.Submissions.peek(course.id, assignment.id, submission)
        .then(function(result) {
            let html = "";

            if (!result['found-user']) {
                html = `<p>Could not find user: '${context.user.name}'.</p>`;
            } else if (!result['found-submission']) {
                if (submission) {
                    html = `<p>Could not find submission: '${submission}'.</p>`;
                } else {
                    html = `<p>Could not find most recent submission.</p>`;
                }
            } else {
                html = Render.submission(course, assignment, result['submission-result']);
            }

            container.innerHTML = html;
        })
        .catch(function(message) {
            container.innerHTML = Render.autograderError(message);
        })
    ;
}

function handlerHistory(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let assignment = course.assignments[params[Routing.PARAM_ASSIGNMENT]];

    container.innerHTML = `
        <div class='history'>
            <div class='history-controls page-controls'>
                <button>Fetch History</button>
            </div>
            <div class='history-results'>
            </div>
        </div>
    `;

    let button = container.querySelector('.history-controls button');
    let results = container.querySelector('.history-results');

    button.addEventListener('click', function(event) {
        doHistory(context, course, assignment, results);
    });

    doHistory(context, course, assignment, results);
}

function doHistory(context, course, assignment, container) {
    Routing.loadingStart(container);

    Autograder.Submissions.history(course.id, assignment.id)
        .then(function(result) {
            let html = "";

            if (!result['found-user']) {
                html = `<p>Could not find user: '${context.user.name}'.</p>`;
            } else {
                html = Render.submissionHistory(course, assignment, result['history']);
            }

            container.innerHTML = html;
        })
        .catch(function(message) {
            container.innerHTML = Render.autograderError(message);
        })
    ;
}

function handlerSubmit(path, params, context, container) {
    // TODO
}

export {
    init,
}
