import * as Autograder from '../autograder/base.js';
import * as Input from './input.js';
import * as Render from './render.js';
import * as Routing from './routing.js';

const COURSE_USER_REFERENCE_DOC_LINK = "https://github.com/edulinq/autograder-server/blob/main/docs/types.md#course-user-reference-courseuserreference";

function init() {
    let requirements = {course: true};
    Routing.addRoute(/^courses$/, handlerCourses, 'Enrolled Courses');
    Routing.addRoute(/^course$/, handlerCourse, 'Course', {course: true});
    Routing.addRoute(/^course\/email$/, handlerEmail, 'Email', {course: true});
    Routing.addRoute(/^course\/list$/, handlerUsers, 'Users', {course: true});
}

function handlerCourses(path, params, context, container) {
    let cards = [];
    for (const [id, course] of Object.entries(context.courses)) {
        let link = Routing.formHashPath(Routing.PATH_COURSE, {[Routing.PARAM_COURSE]: course.id});
        cards.push(Render.makeCardObject('course', course.name, link));
    }

    container.innerHTML = `
        ${Render.cards(cards)}
    `;
}

function handlerCourse(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];

    Routing.setTitle(course.id);

    let assignmentCards = [];
    for (const [id, assignment] of Object.entries(course.assignments)) {
        let args = {
            [Routing.PARAM_COURSE]: course.id,
            [Routing.PARAM_ASSIGNMENT]: assignment.id,
        };

        let link = Routing.formHashPath(Routing.PATH_ASSIGNMENT, args);
        assignmentCards.push(Render.makeCardObject('assignment', assignment.name, link));
    }

    let actionCards = [];
    actionCards.push(Render.makeCardObject(
        "course-action",
        "Email Users",
        Routing.formHashPath(Routing.PATH_EMAIL, {
            [Routing.PARAM_COURSE]: course.id,
        }),
    ));

    actionCards.push(Render.makeCardObject(
        "course-action",
        "List Users",
        Routing.formHashPath(Routing.PATH_COURSE_USERS_LIST, {
            [Routing.PARAM_COURSE]: course.id,
        }),
    ));

    let cardSections = [
        ['Assignments', assignmentCards],
        ['Actions', actionCards],
    ];

    container.innerHTML = `
        <h2>${course.name}</h2>
        ${Render.makeCardSections(cardSections)}
    `;
}

function handlerEmail(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let courseLink = Routing.formHashPath(Routing.PATH_COURSE, {[Routing.PARAM_COURSE]: course.id});

    let titleHTML = `
        <span>
            <a href='${courseLink}'>${course.id}</a>
            / email
        </span>
    `;
    Routing.setTitle(course.id, titleHTML);

    container.innerHTML = `
        <div class="email-page">
            <div class="email-content">
                <h2>Email Users</h2>
                <div class="description">
                    <p>
                        Separate recipient values with commas.
                        For valid recipient values reference this 
                        <a href=${COURSE_USER_REFERENCE_DOC_LINK} target="_blank">documentation</a>.
                    </p>
                </div>
                <div class="user-input-fields secondary-color drop-shadow">
                    <fieldset>
                        <div class="input-field">
                            <label for="email-to">To</label>
                            <input type="text" id="email-to" name="to" />
                        </div>
                        <div class="input-field">
                            <label for="email-cc">CC</label>
                            <input type="text" id="email-cc" name="cc" />
                        </div>
                        <div class="input-field">
                            <label for="email-bcc">BCC</label>
                            <input type="text" id="email-bcc" name="bcc" />
                        </div>
                        <div class="input-field">
                            <label for="email-subject">Subject</label>
                            <input type="text" id="email-subject" name="subject" required />
                        </div>
                        <div class="input-field">
                            <label for="email-body">Content</label>
                            <textarea id="email-body" name="body" rows="10"></textarea>
                        </div>
                        <div class="checkbox-field">
                            <input type="checkbox" id="dry-run" name="dry-run" />
                            <label for="dry-run">Send as Dry Run</label>
                        </div>
                        <div class="checkbox-field">
                            <input type="checkbox" id="html-format" name="html-format" />
                            <label for="html-format">Content is in HTML</label>
                        </div>
                    </fieldset>
                </div>
                <button class="send-email">Send Email</button>
                <div class="results-area"></div>
            </div>
        </div>
    `;

    document.querySelector('button.send-email').addEventListener('click', function(event) {
        Routing.loadingStart(container.querySelector(".results-area"), false);

        let args = {
            [Routing.PARAM_COURSE_ID]: course.id,
            [Routing.PARAM_EMAIL_TO]: extractRecipients(container.querySelector("fieldset [name='to']").value),
            [Routing.PARAM_EMAIL_CC]: extractRecipients(container.querySelector("fieldset [name='cc']").value),
            [Routing.PARAM_EMAIL_BCC]: extractRecipients(container.querySelector("fieldset [name='bcc']").value),
            [Routing.PARAM_EMAIL_SUBJECT]: container.querySelector("fieldset [name='subject']").value,
            [Routing.PARAM_EMAIL_BODY]: container.querySelector("fieldset [name='body']").value,
            [Routing.PARAM_DRY_RUN]: container.querySelector("fieldset [name='dry-run']").checked,
            [Routing.PARAM_EMAIL_HTML]: container.querySelector("fieldset [name='html-format']").checked,
        };

        if (args[Routing.PARAM_EMAIL_TO].length === 0 &&
                args[Routing.PARAM_EMAIL_CC].length === 0 &&
                args[Routing.PARAM_EMAIL_BCC].length === 0) {
            renderResult('<p>Specify at least one recipient.</p>');
            return;
        }

        if (args[Routing.PARAM_EMAIL_SUBJECT].length === 0) {
            renderResult('<p>Include a subject.</p>');
            return;
        }

        Autograder.Course.email(args)
            .then(function(result) {
                renderResult(`
                    <p>Email sent successfully.</p>
                    <pre><code data-lang="json">${JSON.stringify(result, null, 4)}</code></pre>
                `);
            })
            .catch(function(message) {
                console.error(message);
                renderResult(Render.autograderError(message));
            })
        ;
    });
}

function handlerUsers(path, params, context, container) {
    let course = context.courses[params[Routing.PARAM_COURSE]];
    let courseLink = Routing.formHashPath(Routing.PATH_COURSE, {[Routing.PARAM_COURSE]: course.id});

    let titleHTML = `
        <span>
            <a href='${courseLink}'>${course.id}</a>
            / users
        </span>
    `;
    Routing.setTitle(course.id, titleHTML);

    let inputFields = [
        new Input.FieldType(context, Routing.PARAM_TARGET_USERS, 'Target Users', {
            type: Input.COURSE_USER_REFERENCE_LIST_FIELD_TYPE,
        }),
    ];

    let description = `
        List the users in the course (defaults to all users).
    `;

    Render.makePage(
            params, context, container, listUsers,
            {
                header: 'List Users',
                description: description,
                inputs: inputFields,
                buttonName: 'List Users',
            },
        )
    ;
}

function listUsers(params, context, container, inputParams) {
    inputParams[Routing.PARAM_COURSE_ID] = context.courses[params[Routing.PARAM_COURSE]].id;
    return Autograder.Course.users(inputParams)
        .then(function(result) {
            if (result.users.length === 0) {
                return '<p>Unable to find target users.</p>';
            }

            return `<pre>${listCourseUsers(result.users)}</pre`;
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

function listCourseUsers(users) {
    let messages = [];
    for (const user of users) {
        let userParts = [
            `Email: ${user['email']}`,
            `Name: ${user['name']}`,
            `Role: ${user['role']}`,
            `LMS ID: ${user['lms-id']}`,
        ];

        messages.push(`${userParts.join("\n")}`);
    }

    return messages.join("\n\n");
}

function extractRecipients(recipientString) {
    return recipientString
        .split(',')
        .map((recipient) => (recipient.trim()))
        .filter((recipient) => (recipient.length > 0))
    ;
}

function renderResult(message) {
    let resultsArea = document.querySelector(".results-area");
    resultsArea.innerHTML = `<div class="result secondary-color drop-shadow">${message}</div>`;
}

export {
    init,
};
