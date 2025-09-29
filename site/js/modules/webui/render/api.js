import * as RenderJSON from './json.js';
import * as Table from './table.js';
import * as Util from '../util/index.js';

const API_OUTPUT_SWITCHER_JSON = 'JSON';
const API_OUTPUT_SWITCHER_TABLE = 'Table';
const API_OUTPUT_SWITCHER_TEXT = 'Text';

const API_OUTPUT_SWITCHER_MODES = {
    [API_OUTPUT_SWITCHER_JSON]: apiOutputJSON,
    [API_OUTPUT_SWITCHER_TABLE]: apiOutputTable,
    [API_OUTPUT_SWITCHER_TEXT]: apiOutputText,
};

// Options to control how to values that come from the API are rendered.
class APIValueRenderOptions {
    constructor({
            keyDisplayTransformer = Util.titleCase,
            valueDisplayTransformer = apiValueToText,
            skipKeys = [],
            keyCompare = Util.caseInsensitiveStringCompare,
            keyOrdering = [],
            keyValueDelim = ': ',
            rowDelim = "\n",
            entityDelim = "\n",
            indent = '    ',
            initialIndentLevel = 0,
            finalTrim = true,
            } = {}) {
        // How to transform keys for display purposes.
        // Keys are transformed after any comparisons, e.g., sorting.
        this.keyDisplayTransformer = keyDisplayTransformer;

        // How to transform values for display purposes.
        this.valueDisplayTransformer = valueDisplayTransformer;

        // When the rendered value is an object, skip rendering these keys.
        // Keys to skip are checked before any transformations are applied.
        this.skipKeys = skipKeys;

        // A function to compare keys.
        // Keys are compared before any transformations.
        this.keyCompare = keyCompare;

        // The ordering the keys should appear.
        // Keys that exist here will always appear before non-extant keys.
        // May be left empty to just let the key comparison handle all sorting.
        this.keyOrdering = keyOrdering;

        // A delimiter to use between keys and values.
        this.keyValueDelim = keyValueDelim;

        // A delimiter to use between rows.
        this.rowDelim = rowDelim;

        // A delimiter to use between entities.
        this.entityDelim = entityDelim;

        // The spacing to use for a single level of indentation.
        this.indent = indent;

        // The initial indentation level to use.
        this.initialIndentLevel = initialIndentLevel;

        // Trim extra whitespace after processing.
        this.finalTrim = finalTrim;
    }

    // Get an indent level, but treat negative levels as zero.
    getIndent(level) {
        return this.indent.repeat(Math.max(0, level));
    }

    // Sort the given keys in-place according to the given ordering and comparison.
    // The keys should not have been transformed prior to this call.
    sortKeys(keys) {
        let options = this;
        let comparison = function(a, b) {
            return Util.orderingCompare(a, b, options.keyOrdering, options.keyCompare);
        };
        keys.sort(comparison);
    }
}

// Convert a value (of any type) into a text representation.
// These values are generally understood to have come from the autograder API,
// and may have specific semantics.
// The text/output representation is generally meant for human consumption and to be the "pretty" alternative,
// while still be general.
function apiValueToText(value, indentLevel = 0, renderOptions = new APIValueRenderOptions()) {
    if (value === undefined) {
        return '< null >';
    }

    if (value === null) {
        return '< null >';
    }

    switch (typeof(value)) {
        case 'object':
            // Object or Array
            if (Array.isArray(value)) {
                if (value.length == 0) {
                    return '';
                }

                let content = apiArrayToText(value, indentLevel + 1, renderOptions);
                return renderOptions.rowDelim + content;
            } else {
                if (Object.keys(value).length == 0) {
                    return '';
                }

                let content = apiObjectToText(value, indentLevel + 1, renderOptions);
                return renderOptions.rowDelim + content;
            }
        case 'string':
            return value;
        default:
            return JSON.stringify(value);
    }
}

// Convert a value (of any type) into a flat text representation usually used for a table.
function apiValueToTableValue(value, indentLevel = 0, renderOptions = new APIValueRenderOptions()) {
    if (value === undefined) {
        return '';
    }

    if (value === null) {
        return '';
    }

    switch (typeof(value)) {
        case 'string':
            return value;
        default:
            return JSON.stringify(value);
    }
}

// Convert a JS object (from the API) into a text representation.
// See apiValueToText().
function apiObjectToText(object, indentLevel = 0, renderOptions = new APIValueRenderOptions()) {
    let keys = Object.keys(object);
    renderOptions.sortKeys(keys);

    let rows = [];
    for (const key of keys) {
        if (renderOptions.skipKeys.includes(key)) {
            continue;
        }

        let displayKey = key;
        if (renderOptions.keyDisplayTransformer) {
            displayKey = renderOptions.keyDisplayTransformer(key);
        }

        let displayValue = object[key];
        if (renderOptions.valueDisplayTransformer) {
            displayValue = renderOptions.valueDisplayTransformer(object[key], indentLevel, renderOptions);
        }

        let row = [
            renderOptions.getIndent(indentLevel),
            displayKey,
            renderOptions.keyValueDelim,
            displayValue,
        ];
        rows.push(row.join(''));
    }

    return rows.join(renderOptions.rowDelim);
}

// Convert a JS array (from the API) into a text representation.
// See apiValueToText().
function apiArrayToText(items, indentLevel = 0, renderOptions = new APIValueRenderOptions()) {
    let rows = [];
    for (const item of items) {
        let displayValue = item;
        if (renderOptions.valueDisplayTransformer) {
            displayValue = renderOptions.valueDisplayTransformer(item, indentLevel, renderOptions);
        }

        let row = [
            renderOptions.getIndent(indentLevel),
            displayValue,
        ];
        rows.push(row.join(''));
    }

    return rows.join(renderOptions.entityDelim);
}

// Convert a JS array (from the API) into a table representation.
// See apiValueToText().
// The array must be populated with objects (the keys of which will become the columns).
function apiArrayToTable(items, renderOptions = new APIValueRenderOptions()) {
    if (items.length <= 0) {
        return '<p>No Records</p>';
    }

    // Collect keys from all the list items.
    let keys = new Set();
    for (const item of items) {
        keys = keys.union(new Set(Object.keys(item)));
    }

    // Sort the keys.
    keys = Array.from(keys);
    renderOptions.sortKeys(keys);

    // Transform keys.
    let displayKeys = keys;
    if (renderOptions.keyDisplayTransformer) {
        displayKeys = keys.map(renderOptions.keyDisplayTransformer);
    }

    // Transform values.
    let rows = [];
    for (const item of items) {
        let row = [];
        for (const key of keys) {
            row.push(apiValueToTableValue(item[key]));
        }

        rows.push(row);
    }

    return Table.tableFromLists(displayKeys, rows);
}

// Render an area that can switch between rendering an object in different output "modes".
function apiOutputSwitcher(value, container, {
        modes = [API_OUTPUT_SWITCHER_TEXT, API_OUTPUT_SWITCHER_JSON],
        renderOptions = new APIValueRenderOptions()
        } = {}) {
    if (modes.length == 0) {
        throw new Error("No output modes provided.");
    }

    let html = `
        <div class='output-switcher'>
            <div class='controls'>
            </div>
            <hr />
            <div class='output'>
            </div>
        <div>
    `;

    container.innerHTML = html;

    let controlArea = container.querySelector('.controls');
    let outputArea = container.querySelector('.output');

    let prerendered = false;
    for (const mode of modes) {
        let outputFunc = API_OUTPUT_SWITCHER_MODES[mode];
        if (!outputFunc) {
            throw new Error(`Unknown output mode: '${mode}'.`);
        }

        let button = document.createElement('button');
        button.classList.add(mode.toLowerCase());
        button.setAttribute('data-mode', mode);
        button.innerHTML = `Show as ${mode}`;
        button.onclick = function(event) {
            outputFunc(value, outputArea, renderOptions);
        };

        controlArea.appendChild(button);

        // Render the first mode listed.
        if (!prerendered) {
            outputFunc(value, outputArea, renderOptions);
            prerendered = true;
        }
    }
}

// Render an API output as JSON.
function apiOutputJSON(value, container, renderOptions) {
    container.innerHTML = RenderJSON.codeBlockJSON(value);
}

// Render an API output as (pretty) text.
function apiOutputText(value, container, renderOptions) {
    let text = apiArrayToText(value, renderOptions.initialIndentLevel, renderOptions);
    if (renderOptions.finalTrim) {
        text = text.trim();
    }

    container.innerHTML = `<pre>${text}</pre>`;
}

// Render an API output as a table.
function apiOutputTable(value, container, renderOptions) {
    container.innerHTML = apiArrayToTable(value, renderOptions);
}

export {
    API_OUTPUT_SWITCHER_JSON,
    API_OUTPUT_SWITCHER_TABLE,
    API_OUTPUT_SWITCHER_TEXT,

    APIValueRenderOptions,

    apiOutputSwitcher,
};
