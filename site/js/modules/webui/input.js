import * as Autograder from '../autograder/base.js';

// A general representation of a user input field.
class Field {
    constructor(
            name, displayName,
            {
                type = 'text', underlyingType = 'string', required = false, placeholder = '',
                inputClass = '', attributes = '', labelBefore = true, extractInputFunc = undefined
            } = {}) {
        // The name of the field which will be used for targeting the field.
        this.name = name;

        // The display name that will be shown to the user.
        this.displayName = displayName;

        // The HTML input type.
        // Supports checkbox, email, number, password, and text types.
        this.type = type;

        // The underlying type of the field.
        // Non-standard types are parsed to JSON.
        // If a non-standard type cannot be parsed to JSON,
        // a validation error is raised.
        this.underlyingType = underlyingType;

        // Flags the field requires user input.
        this.required = required;

        // The placeholder text for the input.
        this.placeholder = placeholder;

        // Optional classes that are attached to the input.
        this.inputClass = inputClass;

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
    }

    // TODO: Expand validation for inputs.
    // Validate the value of the input.
    // Throws an error on invalid input values.
    validateInputValue(input, fieldType) {
        input.classList.add("touched");

        if (!input.validity.valid) {
            throw new Error(`<p>Field "${input.name}": "${input.validationMessage}".</p>`);
        }

        if (!input || input.value === "") {
            return;
        }

        // Try to parse non-standard field types.
        if (this.shouldJSONParse()) {
            // Throws an error on failure.
            try {
                JSON.parse(`${input.value}`);
            } catch (error) {
                throw new Error(`<p>Field "${input.name}": "${error.message}".</p>`);
            }
        }
    }

    toHTML() {
        this.validate();

        let attributes = this.attributes;
        let displayName = this.displayName;
        if ((this.required) && (this.placeholder === "")) {
            attributes += ' required';
            displayName += ` <span class="required-color">*</span>`;
        }

        let inputFieldHTML = [
            `<label for="${this.name}">${displayName}</label>`,
            `<input type="${this.type}" id="${this.name}" name="${this.name}" placeholder="${this.placeholder}" ${attributes}/>`,
        ];

        if (!this.labelBefore) {
            inputFieldHTML.reverse()
        }

        return `
            <div class="input-field ${this.inputClass}">
                ${inputFieldHTML.join("\n")}
            </div>
        `;
    }

    getKey() {
        return this.name;
    }

    // Get the value from the input.
    // Throws an error on validation errors.
    getValue(container) {
        let input = container.querySelector(`fieldset [name=${this.name}`);
        input.classList.add("touched");

        this.validateInputValue(input, this.underlyingType);

        if (this.extractInputFunc) {
            return this.extractInputFunc(input);
        }

        if (input == undefined) {
            return undefined;
        }

        let value = undefined;
        if (this.type === "checkbox") {
            value = input.checked;
        } else if (this.shouldJSONParse()) {
            value = valueFromJSON(input);
        } else {
            value = input.value;
        }

        return value;
    }

    shouldJSONParse() {
        if ((this.type === "checkbox")
                || (this.type === "email")
                || (this.type === "password")) {
            return false
        }

        if (this.underlyingType === "string") {
            return false
        }

        return true
    }
}

function valueFromJSON(input) {
    if ((!input) || (!input.value) || (input.value === "")) {
        return "";
    }

    // TODO: Make sure this comment holds.
    // The input has already been validated,
    // so parse will not throw an error.
    return JSON.parse(`${input.value}`);
}

export {
    Field,

    valueFromJSON,
};
