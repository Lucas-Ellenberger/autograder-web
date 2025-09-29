import * as Core from '../core/index.js';
import * as Icon from './icon.js';

// Render a page that follows a standard template.
// The template includes a control area, header, description, input area, submission button, and a results area.
// The onSubmitFunc must do the following:
//   - Accept four parameters (params, context, container, inputParams).
//   - Input parameter value validation for special cases should be done in this function.
//   - Return a promise that resolves to the content to display in the results area.
// The page inputs expects a list of Input.Fields, see ./input.js for more information.
// The postResultsFunc (if provided) is called after the results are rendered,
// it will be called with (params, context, container, inputParams, resultHTML).
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
            iconName = Icon.ICON_NAME_DEFAULT,
            postResultsFunc = undefined,
        }) {
    if ((controlAreaHTML) && (controlAreaHTML != '')) {
        controlAreaHTML = `
            <div class="template-control-area secondary-color link-color drop-shadow">
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
            <div class="template-description secondary-color-low link-color-low">
                <p>
                    ${description}
                </p>
            </div>
        `;
    }

    let infoHTML = '';
    if ((headerHTML != '') || (descriptionHTML != '')) {
        infoHTML = `
            <div class='page-information secondary-color drop-shadow'>
                ${Icon.getIconHTML(iconName)}
                <div class='page-text'>
                    ${headerHTML}
                    ${descriptionHTML}
                </div>
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
        buttonHTML = `<button class="template-button secondary-accent-color">${buttonName}</button>`;
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

    let button = container.querySelector(".input-area .template-button");
    button?.addEventListener("click", function(event) {
        submitInputs(params, context, container, inputs, onSubmitFunc, postResultsFunc);
    });

    container.querySelector(".user-input-fields fieldset")?.addEventListener("keydown", function(event) {
        if ((event.key != "Enter") || (event.target.tagName === "TEXTAREA")) {
            return;
        }

        submitInputs(params, context, container, inputs, onSubmitFunc, postResultsFunc);
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

function submitInputs(params, context, container, inputs, onSubmitFunc, postResultsFunc) {
    // If the button is blocked, the server is processing the previous request.
    let button = container.querySelector(".input-area .template-button");
    if (button?.disabled) {
        return;
    }

    let resultsArea = container.querySelector(".results-area");
    resultsArea.innerHTML = `<div class="result secondary-color drop-shadow"></div>`;
    let resultsElement = resultsArea.firstChild;

    Core.Routing.loadingStart(resultsElement, false);

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

        inputParams[result.getFieldName()] = result.getFieldValue();
    }

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

    onSubmitFunc(params, context, resultsElement, inputParams)
        .then(function(result) {
            if (result != undefined) {
                resultsElement.innerHTML = result;
            }

            if (postResultsFunc) {
                postResultsFunc(params, context, container, inputParams, result);
            }
        })
        .catch(function(message) {
            console.error(message);

            if (message != undefined) {
                resultsElement.innerHTML = message;
            }
        })
        .finally(function() {
            if (button) {
                button.disabled = false;
            }

            Core.Event.dispatchEvent(Core.Event.EVENT_TYPE_TEMPLATE_RESULT_COMPLETE);
        })
    ;
}

export {
    makePage,
};
