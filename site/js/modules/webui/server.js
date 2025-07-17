import * as Autograder from '../autograder/base.js';

import * as Input from './input.js';
import * as Render from './render.js';
import * as Routing from './routing.js';

// The priority of the field to show first.
// Items later in the list have the highest priority.
const FIELD_PRIORITY = [
    "assignment-id",
    "course-id",
    "user-pass",
    "user-email",
];

const PATTERN_INT = /^int\d*$/;
const PATTERN_TARGET_USER = /^core\.Target((Course)|(Server))User$/;
const PATTERN_TARGET_SELF_OR = /^core\.Target((Course)|(Server))UserSelfOr[a-zA-Z]+$/;

function init() {
    Routing.addRoute(/^server$/, handlerServer, 'Server Actions', undefined);
    Routing.addRoute(/^server\/call-api$/, handlerCallAPI, 'Call API', undefined);
    Routing.addRoute(/^server\/docs$/, handlerDocs, "API Documentation");
}

function handlerServer(path, params, context, container) {
    Routing.loadingStart(container);

    let args = {
        [Routing.PARAM_TARGET_ENDPOINT]: params[Routing.PARAM_TARGET_ENDPOINT],
    };

    let cards = [
        Render.makeCardObject('server-action', 'API Documentation', Routing.formHashPath(Routing.PATH_SERVER_DOCS)),
        Render.makeCardObject('server-action', 'Call API', Routing.formHashPath(Routing.PATH_SERVER_CALL_API, args)),
    ];

    container.innerHTML = `
        ${Render.cards(cards)}
    `;
}

function handlerCallAPI(path, params, context, container) {
    Routing.loadingStart(container);

    Autograder.Server.describe()
        .then(function(result) {
            const endpoints = result["endpoints"];
            const selectedEndpoint = params[Routing.PARAM_TARGET_ENDPOINT] ?? undefined;

            render(endpoints, selectedEndpoint, params, context, container);
        })
        .catch(function(message) {
            console.error(message);
            container.innerHTML = Render.autograderError(message);
        })
    ;
}

function render(endpoints, selectedEndpoint, params, context, container) {
    let selector = renderSelector(endpoints, selectedEndpoint);
    let selectorHTML = `<div class="endpoint-controls">${selector}</div>`;

    let inputFields = getInputFields(endpoints, selectedEndpoint, context);

    Render.makePage(
            params, context, container, callEndpoint,
            {
                className: 'call-endpoint',
                controlAreaHTML: selectorHTML,
                header: selectedEndpoint,
                inputs: inputFields,
                buttonName: 'Call Endpoint',
            },
        )
    ;

    container.querySelector(".endpoint-controls select").addEventListener("change", function(event) {
        let newParams = {
            [Routing.PARAM_TARGET_ENDPOINT]: event.target.value,
        };

        let path = Routing.formHashPath(Routing.PATH_SERVER_CALL_API, newParams);
        Routing.redirect(path);
    });
}

function renderSelector(endpoints, selectedEndpoint) {
    let optionsList = [];

    for (const endpoint of Object.keys(endpoints)) {
        let isSelected = "";
        if (endpoint === selectedEndpoint) {
            isSelected = "selected";
        }

        optionsList.push(`<option value="${endpoint}" ${isSelected}>${endpoint}</option>`);
    }

    return `
        <select id="endpoint-dropdown">
            <option value="">Select an endpoint...</option>
            ${optionsList.join("\n")}
        </select>
    `;
}

function getInputFields(endpoints, selectedEndpoint, context) {
    if (!(selectedEndpoint in endpoints)) {
        return [];
    }

    let sortedInputs = endpoints[selectedEndpoint]["input"];
    sortedInputs.sort(function(a, b) {
        let aPriority = FIELD_PRIORITY.indexOf(a.name);
        let bPriority = FIELD_PRIORITY.indexOf(b.name);

        return bPriority - aPriority;
    });

    let inputFields = [];
    for (const field of sortedInputs) {
        inputFields.push(getInputField(context, field.name, field.type, field.required));
    }

    return inputFields;
}

// Given the context and field information,
// returns an Input.Field.
function getInputField(context, fieldName = "", fieldType = "", requiredField = false) {
    let inputType = "text";
    let displayName = `${fieldName}`;
    let placeholder = "";

    let fieldClass = "";
    let extraFields = "";
    let labelBefore = true;

    if (PATTERN_TARGET_SELF_OR.test(fieldType)) {
        inputType = "email";
        displayName += ` (expects: ${fieldType})`;
        placeholder = context.user.email;
    } else if (PATTERN_TARGET_USER.test(fieldType)) {
        inputType = "email";
        displayName += ` (expects: ${fieldType})`;
    } else if (PATTERN_INT.test(fieldType)) {
        inputType = "number";
        displayName += ` (expects: ${fieldType})`;

        extraFields += ` pattern="\d*"`;
    } else if (fieldType === "bool") {
        inputType = "checkbox";

        fieldClass += " checkbox-field";
        extraFields += ` value="true"`;
        labelBefore = false;
    } else {
        displayName += ` (expects: ${fieldType})`;
    }

    // Due to the context credentials, remind the user the email and pass fields are optional.
    if (fieldName === "user-email") {
        inputType = "email";
        placeholder = context.user.email;
    } else if (fieldName === "user-pass") {
        inputType = "password";
        placeholder = "<current token>";
    }

    return new Input.Field(fieldName, displayName, {
            type: inputType,
            underlyingType: fieldType,
            required: requiredField,
            placeholder: placeholder,
            inputClass: fieldClass,
            attributes: extraFields,
            labelBefore: labelBefore,
        })
    ;
}

function callEndpoint(params, context, container, inputParams) {
    const targetEndpoint = params[Routing.PARAM_TARGET_ENDPOINT] ?? undefined;
    if (!targetEndpoint) {
        return Promise.resolve("Unable to find target endpoint.");
    }

    let overrideEmail = undefined;
    if (inputParams["user-email"]) {
        overrideEmail = inputParams["user-email"];

        // Remove the unnecessary email field.
        delete inputParams["user-email"];
    }

    let overrideCleartext = undefined;
    if (inputParams["user-pass"]) {
        overrideCleartext = inputParams["user-pass"];

        // Remove the unnecessary password field.
        delete inputParams["user-pass"];
    }

    return Autograder.Server.callEndpoint({
            targetEndpoint: targetEndpoint,
            params: inputParams,
            overrideEmail: overrideEmail,
            overrideCleartext: overrideCleartext,
            clearContextUser: false,
        })
        .then(function(result) {
            return `
                <pre><code class="code code-block" data-lang="json">${JSON.stringify(result, null, 4)}</code></pre>
            `;
        })
        .catch(function(message) {
            console.error(message)
            return message;
        })
    ;
}

function handlerDocs(path, params, context, container) {
    Routing.setTitle("API Documentation", "API Documentation");

    Autograder.Server.describe()
        .then(function(result) {
            container.innerHTML = displayDocumentation(result);

            setupFilters(container);
        })
        .catch(function (message) {
            console.error(message);
            container.innerHTML = Render.autograderError(message);
        })
    ;
}

function displayDocumentation(data) {
    return `
        <div class="api-docs">
            <div class="endpoints">
                <h1>Endpoints</h1>
                <input type="text" placeholder="Filter Endpoints">
                <div class="scrollable">
                    ${displayEndpoints(data.endpoints)}
                </div>
            </div>
            <div class="api-types">
                <h1>Types</h1>
                <input type="text" placeholder="Filter Types">
                <div class="scrollable">
                    ${displayTypes(data.types)}
                </div>
            </div>
        </div>
    `;
}

function setupFilters(container) {
    container.querySelector(".endpoints input").addEventListener("input", function(event) {
        container.querySelectorAll(".api-docs .endpoints .endpoint").forEach(function(endpointDiv) {
            let endpoint = endpointDiv.getAttribute("data-endpoint");
            if (endpoint.toLowerCase().includes(event.target.value.toLowerCase())) {
                endpointDiv.classList.remove("hidden");
            } else {
                endpointDiv.classList.add("hidden");
            }
        });
    });

    container.querySelector(".api-types input").addEventListener("input", function(event) {
        container.querySelectorAll(".api-docs .api-types .api-type").forEach(function(typeDiv) {
            let type = typeDiv.getAttribute("data-api-type");
            if (type.toLowerCase().includes(event.target.value.toLowerCase())) {
                typeDiv.classList.remove("hidden");
            } else {
                typeDiv.classList.add("hidden");
            }
        });
    });
}

function displayEndpoints(endpointData) {
    let endpoints = [];

    Object.entries(endpointData).forEach(function([endpoint, data]) {
        let args = {
            [Routing.PARAM_TARGET_ENDPOINT]: endpoint,
        };

        let inputTypes = Render.tableFromDictionaries(
            [["name", "Name"], ["type", "Type"]],
            data.input,
        );

        let outputTypes = Render.tableFromDictionaries(
            [["name", "Name"], ["type", "Type"]],
            data.output,
        );

        endpoints.push(`
            <div class="endpoint" data-endpoint="${endpoint}">
                <a href="${Routing.formHashPath(Routing.PATH_SERVER_CALL_API, args)}">
                    <h3>${endpoint}</h3>
                </a>
                <p>${data.description}</p>
                <div class="endpoint-details">
                    <div>
                        <h4>Input</h4>
                        ${inputTypes}
                    </div>
                    <div>
                        <h4>Output</h4>
                        ${outputTypes}
                    </div>
                </div>
            </div>
        `);
    });

    return endpoints.join("\n");
}

function displayTypes(typeData) {
    let types = [];

    Object.entries(typeData).forEach(function([type, data]) {
        let fieldData = "";
        if (data.fields) {
            let fieldTypes = Render.tableFromDictionaries(
                [["name", "Name"], ["type", "Type"]],
                data.fields,
            );

            fieldData = `
            	<div class="api-type-details">
                    <div>
                        <h4>Fields</h4>
                        ${fieldTypes}
                    </div>
                </div>
            `;
        }

        types.push(`
            <div class="api-type" data-api-type="${type}">
                <h3>${type}</h3>
                <p>${data.description ?? ""}</p>
                <h4>Category</h4>
                <p>${data.category}</p>
                ${fieldData}
            </div>
        `);
    });

    return types.join("\n");
}

export {
    init,
};
