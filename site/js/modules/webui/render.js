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
// The template includes a control area, header, description, input area, submission button, and a results area.
// The onSubmitFunc must do the following:
//   - Accept four parameters (params, context, container, inputParams).
//   - Return a promise that resolves to the content to display in the results area.
// The page inputs expects a list of Input.Fields, see ./input.js for more information.
function makePage(
        params, context, container, onSubmitFunc,
        {
            className = '',
            controlAreaHTML = '',
            header = '',
            description = '',
            inputs = [],
            buttonName = 'Submit',
            // Click the submit button as soon as the page is created.
            submitOnCreation = false,
        }) {
    if ((controlAreaHTML) && (controlAreaHTML != '')) {
        controlAreaHTML = `
            <div class="template-control-area secondary-color drop-shadow">
                ${controlAreaHTML}
            </div>
        `;
    }

    let headerHTML = '';
    if ((header) && (header != '')) {
        headerHTML = `
            <div class="template-header">
                <h2>${header}</h2>
            </div>
        `;
    }

    let descriptionHTML = '';
    if ((description) && (description != '')) {
        descriptionHTML = `
            <div class="template-description">
                <p>
                    ${description}
                </p>
            </div>
        `;
    }

    let infoHTML = '';
    if ((headerHTML != '') || (descriptionHTML != '')) {
        infoHTML = `
            <div class="page-information secondary-color drop-shadow">
                ${headerHTML}
                ${descriptionHTML}
            </div>
        `;
    }

    let inputFieldsHTML = '';
    if ((inputs) && (inputs.length > 0)) {
        let inputHTML = '';
        for (const input of inputs) {
            inputHTML += input.toHTML();
        }

        inputFieldsHTML = `
            <div class="user-input-fields secondary-color drop-shadow">
                <fieldset>
                    ${inputHTML}
                </fieldset>
            </div>
        `;
    }

    let buttonHTML = '';
    if (onSubmitFunc) {
        buttonHTML = `<button class="template-button">${buttonName}</button>`;
    }

    let inputSectionHTML = `
        <div class="input-area">
            ${inputFieldsHTML}
            ${buttonHTML}
        </div>
    `;

    container.innerHTML = `
        <div class="template-page ${className}">
            <div class="template-content">
                ${controlAreaHTML}
                ${infoHTML}
                ${inputSectionHTML}
                <div class="results-area"></div>
            </div>
        </div>
    `;

    let button = container.querySelector(".input-area .template-button")
    button?.addEventListener("click", function(event) {
        submitInputs(params, context, container, inputs, onSubmitFunc);
    });

    container.querySelector(".user-input-fields fieldset")?.addEventListener("keydown", function(event) {
        if ((event.key != "Enter") || (event.target.tagName === "TEXTAREA")) {
            return;
        }

        submitInputs(params, context, container, inputs, onSubmitFunc);
    });

    container.querySelectorAll(".user-input-fields fieldset input")?.forEach(function(input) {
        input.addEventListener("blur", function(event) {
            input.classList.add("touched");

            let currentPageInput = undefined;
            for (const pageInput of inputs) {
                if (pageInput.name === input.name) {
                    currentPageInput = pageInput;
                    break;
                }
            }

            // Validate the input after the field loses focus.
            if (currentPageInput) {
                try {
                    currentPageInput.getFieldInstance(container);
                } catch (error) {
                    console.error(error);
                    return;
                }
            }
        });
    });

    if (submitOnCreation) {
        button?.click();
    }
}

function submitInputs(params, context, container, inputs, onSubmitFunc) {
    // If the button is blocked, the server is processing the previous request.
    let button = container.querySelector(".input-area .template-button");
    if (button?.disabled) {
        return;
    }

    Routing.loadingStart(container.querySelector(".results-area"), false);

    let inputParams = {};
    let errorMessages = [];

    for (const input of inputs) {
        let result = undefined;
        try {
            result = input.getFieldInstance(container);
        } catch (error) {
            errorMessages.push(error.message);
            continue;
        }

        let value = result.getFieldValue();
        if ((value) && (value != "")) {
            inputParams[result.getFieldName()] = value;
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

    if (button) {
        button.disabled = true;
    }

    onSubmitFunc(params, context, container, inputParams)
        .then(function(result) {
            resultsArea.innerHTML = `<div class="result secondary-color drop-shadow">${result}</div>`;
        })
        .catch(function(message) {
            console.error(message);
            resultsArea.innerHTML = `<div class="result secondary-color drop-shadow">${message}</div>`;
        })
        .finally(function() {
            if (button) {
                button.disabled = false;
            }
        })
    ;
}

// Set the page title given a list of title parts.
// Each page title part is [display name, optional link].
// If title parts is empty, the page title defaults to the tab title.
function makeTitle(tabTitle, pageTitleParts = []) {
    let titlePartsHTML = [];
    for (const part of pageTitleParts) {
        let displayName = part[0];
        let link = part[1];

        if (link) {
            titlePartsHTML.push(`<a href='${link}'>${displayName}</a>`);
        } else {
            titlePartsHTML.push(displayName);
        }
    }

    let titleHTML = '';
    if (titlePartsHTML.length > 0) {
        titleHTML = `
            <span>
                ${titlePartsHTML.join(" / ")}
            </span>
        `;
    } else {
        titleHTML = `<span>${tabTitle}</span>`;
    }

    document.querySelector('.page .page-title').innerHTML = titleHTML;
    document.title = `${tabTitle} :: Autograder`;
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

function displayJSON(json) {
    return `<pre><code class="code code-block" data-lang="json">${JSON.stringify(json, null, 4)}</code></pre>`;
}

export {
    autograderError,
    card,
    cards,
    displayJSON,
    makeCardObject,
    makeCardSection,
    makeCardSections,
    makePage,
    makeTitle,
    submission,
    submissionHistory,
    tableFromDictionaries,
    tableFromLists,
};
