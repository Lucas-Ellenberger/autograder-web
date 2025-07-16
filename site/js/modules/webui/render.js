import * as Assignment from './assignment.js';
import * as Routing from './routing.js';
import * as Util from './util.js';

function makeCardObject(type = 'unknown', text = '', link = '#') {
    return {
        type: type,
        text: text,
        link: link,
    };
}

function card(card = {type: 'unknown', text: '', link: '#'}) {
    return `
        <div class='card card-${card.type} secondary-color drop-shadow'>
            <a href='${card.link}' alt='${card.text}'>
                <span>${card.text}</span>
            </a>
        </div>
    `;
}

// Render some cards to html.
// This function takes ownership of the list of cards.
function cards(cards) {
    cards.sort(function(a, b) {
        return Util.caseInsensitiveStringCompare(a.text, b.text);
    });

    let html = [];
    for (const item of cards) {
        html.push(card(item));
    }

    return `
        <div class='cards-area'>
            ${html.join("\n")}
        </div>
    `;
}

// Render a list of card sections to html.
// A card section is [section name, a list of cards].
function makeCardSections(sections) {
    let cardSections = [];
    for (const section of sections) {
        cardSections.push(makeCardSection(section[0], section[1]));
    }

    return `
        <div class='card-sections'>
            ${cardSections.join("\n")}
        <div>
    `;
}

// Render a section name and some cards to html.
function makeCardSection(sectionName, sectionCards) {
    return `
        <div class='card-section'>
            <h3>${sectionName}</h3>
            ${cards(sectionCards)}
        </div>
    `;
}

// Render a page that follows a standard template.
// The template includes a header, description, input area, submission button, and a results area.
// The onSubmitFunc must return a promise that resolves to the content that should be displayed in the results area.
// The page inputs expects a list of Input.Fields, see ./input.js for more information.
function makePage(
        params, context, container, onSubmitFunc,
        page = {className: '', header: '', description: '', inputs: [], buttonName: 'Submit'}) {
    let inputHTML = '';
    for (const input of page.inputs) {
        inputHTML += input.toHTML();
    }

    container.innerHTML = `
        <div class="template-page ${page.className}">
            <div class="template-content">
                <h2>${page.header}</h2>
                <div class="description">
                    <p>
                        ${page.description}
                    </p>
                </div>
                <div class="user-input-fields secondary-color drop-shadow">
                    <fieldset>
                        ${inputHTML}
                    </fieldset>
                </div>
                <button class="template-button">${page.buttonName}</button>
                <div class="results-area"></div>
            </div>
        </div>
    `;

    container.querySelector("button").addEventListener("click", function(event) {
        populateResultsArea(params, context, container, page.inputs, onSubmitFunc);
    });

    container.querySelector(".user-input-fields fieldset").addEventListener("keydown", function(event) {
        if (event.key != "Enter") {
            return;
        }

        populateResultsArea(params, context, container, page.inputs, onSubmitFunc);
    });

    container.querySelectorAll(".user-input-fields fieldset input").forEach(function(input) {
        input.addEventListener("blur", function(event) {
            input.classList.add("touched");
        });
    });
}

function populateResultsArea(params, context, container, inputs, onSubmitFunc) {
    Routing.loadingStart(container.querySelector(".results-area"), false);

    let inputParams = {};
    let errorMessages = [];

    for (const input of inputs) {
        let value = undefined;
        try {
            value = input.getValue(container);
        } catch (error) {
            console.error(error);
            errorMessages.push(error.message);
            continue;
        }

        if (value != "") {
            inputParams[input.getKey()] = value;
        }
    }

    let resultsArea = container.querySelector(".results-area");

    if (errorMessages.length > 0) {
        resultsArea.innerHTML = `
            <div class="result secondary-color drop-shadow">
                <p>The request was not submitted to the autograder due to the following errors:</p>
                ${errorMessages.join("\n")}
            </div>
        `;
        return;
    }

    onSubmitFunc(params, context, container, inputParams)
        .then(function(result) {
            resultsArea.innerHTML = `<div class="result secondary-color drop-shadow">${result}</div>`;
        })
        .catch(function(message) {
            console.error(message);
            resultsArea.innerHTML = `<div class="result secondary-color drop-shadow">${message}</div>`;
        })
    ;
}

function submissionHistory(course, assignment, history) {
    let rowsHTML = [];
    for (const record of history.toReversed()) {
        let submissionTime = Util.timestampToPretty(record['grading_start_time']);

        let params = {
            [Routing.PARAM_COURSE]: course.id,
            [Routing.PARAM_ASSIGNMENT]: assignment.id,
            [Routing.PARAM_SUBMISSION]: record['short-id'],
        };
        let peekLink = Routing.formHashPath(Routing.PATH_PEEK, params);

        rowsHTML.push(`
            <tr>
                <td><a href='${peekLink}'>${record['short-id']}</a></td>
                <td>${record['score']}</td>
                <td>${record['max_points']}</td>
                <td>${submissionTime}</td>
                <td>${record['message']}</td>
            </tr>
        `);
    }

    let html = `
        <div class='submission-history-area'>
            <h2>${assignment.name}: History</h2>
            <div class='submission-history'>
                <h3>History</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Short ID</th>
                            <th>Score</th>
                            <th>Max Points</th>
                            <th>Submission Time</th>
                            <th>Message</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHTML.join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    return html;
}

function submission(course, assignment, submission) {
    let submissionTime = Util.timestampToPretty(submission['grading_start_time']);

    let messageHTML = '';
    if (submission.message) {
        messageHTML = makePairedTableRow('Message', submission['message'], 'message');
    }

    let courseLink = Routing.formHashPath(Routing.PATH_COURSE,
            {[Routing.PARAM_COURSE]: course.id});
    let assignmentLink = Routing.formHashPath(Routing.PATH_ASSIGNMENT,
            {[Routing.PARAM_COURSE]: course.id, [Routing.PARAM_ASSIGNMENT]: assignment.id});

    let html = `
        <div class='submission'>
            <h2>${assignment.name}: Submission ${submission['short-id']}</h2>
            <div class='submission-metadata'>
                <h3>Summary</h3>
                <table>
                    <tbody>
                        ${makePairedTableRow('Short Submission ID', submission['short-id'], 'short-id')}
                        ${makePairedTableRow('Full Submission ID', submission['id'], 'id')}
                        ${makePairedTableRow('User', submission['user'], 'user')}
                        ${makePairedTableRow('Course ID', `<a href='${courseLink}'>${submission['course-id']}</a>`, 'course-id')}
                        ${makePairedTableRow('Assignment ID', `<a href='${assignmentLink}'>${submission['assignment-id']}</a>`, 'assignment-id')}
                        ${makePairedTableRow('Submission Time', submissionTime, 'submission-time')}
                        ${makePairedTableRow('Max Points', submission['max_points'], 'max-points')}
                        ${makePairedTableRow('Score', submission['score'], 'score')}
                        ${messageHTML}
                    </tbody>
                </table>
            </div>
            <div class='submission-questions-area'>
                <h3>Questions</h3>
                ${submissionQuestions(submission.questions)}
            </div>
        </div>
    `;

    return html;
}

function submissionQuestions(questions) {
    let questionsHTML = [
        `<div class='submission-questions'>`,
    ];

    for (const [i, question] of questions.entries()) {
        let messageHTML = '';
        if (question.message) {
            messageHTML = makePairedTableRow('Message', question['message'], 'message');
        }

        questionsHTML.push(`
            <div class='submission-question'>
                <h4 data-index='${i}' data-name='${question['name']}'>
                    ${question['name']}
                </h4>
                <table data-index='${i}' data-name='${question['name']}'>
                    <tbody>
                        ${makePairedTableRow('Name', question['name'], 'name')}
                        ${makePairedTableRow('Max Points', question['max_points'], 'max-points')}
                        ${makePairedTableRow('Score', question['score'], 'score')}
                        ${messageHTML}
                    </tbody>
                </table>
            </div>
        `);
    }

    questions.push('</div>');

    return questionsHTML.join('');
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

function makePairedTableRow(label, value, name = undefined) {
    let nameHTML = '';
    if (name) {
        nameHTML = `data-name='${name}'`;
    }

    return `
        <tr ${nameHTML}>
            <th class='label'>${label}</th>
            <td class='value'>${value}</td>
        </tr>
    `;
}

function autograderError(message) {
    let result = '<p>The request to the autograder did not complete successfully.</p>';

    if (message) {
        result += `
            <span>Message from the autograder:<span>
            <p>${message}</p>
        `;
    }

    return result;
}

// Create a table using an array of arrays.
// Each header is a string.
// Each row is an array of strings.
// A list of HTML classes may be added to aid styling.
function tableFromLists(headers, rows, classes = []) {
    let tableHead = headers.map((label) => (`<th>${label}</th>`));
    let tableBody = rows.map(function(row) {
            return `<tr>${row.map((value) => (`<td>${value}</td>`)).join('')}</tr>`;
        })
    ;

    return `
        <table class='standard-table ${classes.join(' ')}'>
            <thead>
                <tr>
                    ${tableHead.join('')}
                </tr>
            </thead>
            <tbody>
                ${tableBody.join('')}
            </tbody>
        </table>
    `;
}

// Create a table using array of dictionaries.
// Each row is representated a dictionary.
// Each header is represented as an array,
// ex. ["key", "displayValue"],
// where keys match the keys in the row dictionaries.
// A list of HTML classes may be added to aid styling.
function tableFromDictionaries(headers, rows, classes = []) {
    let keys = headers.map((label) => (label[0]));
    let tableHead = headers.map((label) => (label[1]));

    let tableBody = rows.map(function(row) {
        let items = [];
        keys.forEach(function(key) {
            items.push(row[key] ?? '');
        });

        return items;
    });

    return tableFromLists(tableHead, tableBody, classes);
}

export {
    autograderError,
    card,
    cards,
    listCourseUsers,
    makeCardObject,
    makeCardSection,
    makeCardSections,
    makePage,
    submission,
    submissionHistory,
    tableFromDictionaries,
    tableFromLists,
};
