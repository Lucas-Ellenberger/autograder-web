import * as Autograder from '../../autograder/index.js';
import * as Core from '../core/index.js';
import * as Render from '../render/index.js';

// The priority of the field to show first.
// Items later in the list have the highest priority.
const FIELD_PRIORITY = [
    "assignment-id",
    "course-id",
    "user-pass",
    "user-email",
];

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_SERVER_CALL_API, handlerCallAPI, 'Call API', Core.Routing.NAV_SERVER, undefined);
}

function handlerCallAPI(path, params, context, container) {
    Core.Routing.loadingStart(container);

    Autograder.Metadata.describe()
        .then(function(result) {
            const endpoints = result["endpoints"];
            const selectedEndpoint = params[Core.Routing.PARAM_TARGET_ENDPOINT] ?? undefined;

            render(endpoints, selectedEndpoint, params, context, container);
        })
        .catch(function(message) {
            console.error(message);
            container.innerHTML = Render.autograderError(message);
        })
    ;
}

function render(endpoints, selectedEndpoint, params, context, container) {
    let description = undefined;
    if (selectedEndpoint in endpoints) {
        description = endpoints[selectedEndpoint].description;
    } else {
        selectedEndpoint = undefined;
    }

    let selectorHTML = renderSelector(context, endpoints, selectedEndpoint);
    let inputFields = getInputFields(endpoints, selectedEndpoint, context);

    let onSubmitFunc = undefined;
    if (selectedEndpoint) {
        onSubmitFunc = callEndpoint;
    }

    Render.makePage(
            params, context, container, onSubmitFunc,
            {
                className: 'call-endpoint',
                controlAreaHTML: selectorHTML,
                header: selectedEndpoint,
                description: description,
                inputs: inputFields,
                buttonName: 'Call Endpoint',
                iconName: Render.ICON_NAME_CALL_ENDPOINT,
            },
        )
    ;

    container.querySelector(".template-control-area select").addEventListener("change", function(event) {
        let newParams = {
            [Core.Routing.PARAM_TARGET_ENDPOINT]: event.target.value,
        };

        let path = Core.Routing.formHashPath(Core.Routing.PATH_SERVER_CALL_API, newParams);
        Core.Routing.redirect(path);
    });
}

function renderSelector(context, endpoints, selectedEndpoint) {
    let optionsList = [];
    for (const endpoint of Object.keys(endpoints)) {
        optionsList.push(new Render.SelectOption(endpoint));
    }

    let selector = new Render.FieldType(context, "endpoint-dropdown", "Select an endpoint...", {
        type: Render.INPUT_TYPE_SELECT,
        choices: optionsList,
        defaultValue: selectedEndpoint,
    });

    return `
        <fieldset>
            ${selector.toHTML()}
        </fieldset>
    `;
}

function getInputFields(endpoints, selectedEndpoint, context) {
    if (!selectedEndpoint) {
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
        inputFields.push(new Render.FieldType(context, field.name, field.name, {
            type: field.type,
            required: field.required,
        }));
    }

    return inputFields;
}

function callEndpoint(params, context, container, inputParams) {
    const targetEndpoint = params[Core.Routing.PARAM_TARGET_ENDPOINT] ?? undefined;
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

    return Autograder.Misc.callEndpoint({
            targetEndpoint: targetEndpoint,
            params: inputParams,
            overrideEmail: overrideEmail,
            overrideCleartext: overrideCleartext,
            clearContextUser: false,
        })
        .then(function(result) {
            return Render.codeBlockJSON(result);
        })
        .catch(function(message) {
            console.error(message)
            return Render.autograderError(message);
        })
    ;
}

init();
