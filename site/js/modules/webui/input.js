import * as Autograder from '../autograder/base.js';

// A general representation of a user input field.
class Field {
    constructor(
            name, displayName, key,
            {
                type = 'string', required = false, placeholder = '',
                attributes = '', labelBefore = true, extractInputFunc = undefined
            } = {}) {
        // The name of the field which will be used for targeting the field.
        this.name = name;

        // The display name that will be shown to the user.
        this.displayName = displayName;

        // The key used for the JSON field.
        this.key = key;

        // The HTML input type.
        // For more information about possible types,
        // see https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#input_types.
        this.type = type;

        // Flags the field requires user input.
        this.required = required;

        // The placeholder for the input.
        this.placeholder = placeholder;

        // Any additional attributes to the input field.
        // If the field is required, the required attribute will be added automatically.
        this.attributes = attributes;

        // Determines the position of the HTML label with respect to the input.
        this.labelBefore = labelBefore;

        // A custom function for extracting the value from an input.
        // By default, the input.value will be returned.
        this.extractInputFunc = extractInputFunc;
    }

    validate() {
        if ((this.name == undefined) || (this.name == '')) {
            console.error(`Input field cannot have an empty name: ${JSON.stringify(this)}`);
        }

        if ((this.displayName == undefined) || (this.displayName == '')) {
            console.error(`Input field cannot have an empty display name: ${JSON.stringify(this)}.`);
        }

        if ((this.key == undefined) || (this.key == '')) {
            console.error(`Input field caKeynnot have an empty key: ${JSON.stringify(this)}.`);
        }
    }

    toHTML() {
        this.validate();

        let attributes = this.attributes;
        let displayName = this.displayName;
        if (this.required) {
            attributes += ' required';
            displayName += ` <span class="required-color">*</span>`;
        }

        const label = `<label for="${this.name}">${displayName}</label>`;
        const input = `<input type="${this.type}" id="${this.name}" name="${this.name}" placeholder="${this.placeholder}" ${attributes}/>`;

        if (this.labelBefore) {
            return `
                <div class="input-field">
                    ${label}
                    ${input}
                </div>
            `;
        } else {
            return `
                <div class="input-field">
                    ${input}
                    ${label}
                </div>
            `;
        }
    }

    getKey() {
        return this.key;
    }

    getValue(container) {
        let input = container.querySelector(`fieldset [name=${this.name}`);
        input.classList.add("touched");

        let value = undefined;
        if (this.extractInputFunc) {
            value = this.extractInputFunc(input);
        } else {
            if (input == undefined) {
                return undefined;
            }

            value = input.value;
        }

        return value;
    }
}

function valueFromCheckbox(input) {
    if (input == undefined) {
        return undefined;
    }

    return input.checked;
}

function valueFromJSON(input) {
    if (input == undefined) {
        return undefined;
    }

    if (input.value === "") {
        return "";
    }

    let value = undefined;
    // Users can input complex types into text boxes.
    // Attempt to parse the input string into JSON.
    // Fallback to the raw input in case the input is not meant to be JSON.
    try {
        value = JSON.parse(`${input.value}`);
    } catch (error) {
        console.error(error);
        value = input.value;
    }

    return value;
}

export {
    Field,

    valueFromCheckbox,
    valueFromJSON,
};
