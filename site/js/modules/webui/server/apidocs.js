import * as Autograder from '../../autograder/index.js';
import * as Core from '../core/index.js';
import * as Render from '../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_SERVER_DOCS, handlerDocs, "API Documentation", Core.Routing.NAV_SERVER);
}

function handlerDocs(path, params, context, container) {
    Render.setTabTitle('API Documentation');

    Autograder.Metadata.describe()
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
            [Core.Routing.PARAM_TARGET_ENDPOINT]: endpoint,
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
                <a href="${Core.Routing.formHashPath(Core.Routing.PATH_SERVER_CALL_API, args)}">
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

init();
