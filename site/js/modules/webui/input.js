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
        // If a default value extraction cannot be inferred, the value is parsed using JSON.
        this.extractInputFunc = extractInputFunc;
    }

    validate() {
        if ((this.name == undefined) || (this.name == '')) {
            console.error(`Input field cannot have an empty name: ${JSON.stringify(this)}.`);
        }

        if ((this.displayName == undefined) || (this.displayName == '')) {
            console.error(`Input field cannot have an empty display name: ${JSON.stringify(this)}.`);
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
            inputFieldHTML.reverse();
        }

        return `
            <div class="input-field ${this.inputClass}">
                ${inputFieldHTML.join("\n")}
            </div>
        `;
    }

    getResult(container) {
        let input = container.querySelector(`fieldset [name=${this.name}]`);
        input.classList.add("touched");

        return new Result(input, this.underlyingType, this.extractInputFunc);
    }
}

// The result of getting an Input.Field.
class Result {
    constructor(input, underlyingType, extractInputFunc = undefined) {
        // The input from the query selector.
        this.input = input;

        // See Field for field descriptions.
        this.underlyingType = underlyingType;
        this.extractInputFunc = extractInputFunc;
    }

    // Validate the value of the input.
    // Throws an error on invalid input values.
    validate() {
        if (!this.input.validity.valid) {
            throw new Error(`${this.input.validationMessage}`);
        }

        // Skip further validation if a custom extraction function is provided.
        if (this.extractInputFunc != undefined) {
            return;
        }

        if (!this.input || this.input.value === "") {
            return;
        }

        // Try to parse non-standard field types.
        if (shouldJSONParse(this.input.type, this.underlyingType)) {
            // Throws an error on failure.
            JSON.parse(`${this.input.value}`);
        }
    }

    getKey() {
        return this.input.name;
    }

    // Get the value from the result.
    // Throws an error on validation errors.
    getValue() {
        try {
            this.validate();
        } catch (error) {
            throw new Error(`<p>Field "${this.input.name}": "${error.message}".</p>`);
        }

        if (this.extractInputFunc) {
            return this.extractInputFunc(input);
        }

        if (this.input == undefined) {
            return undefined;
        }

        let value = undefined;
        if (this.input.type === "checkbox") {
            value = this.input.checked;
        } else if (shouldJSONParse(this.input.type, this.underlyingType)) {
            value = this.valueFromJSON();
        } else {
            value = this.input.value;
        }

        return value;
    }

    valueFromJSON() {
        if ((!this.input) || (!this.input.value) || (this.input.value === "")) {
            return "";
        }

        // The input has already been validated,
        // so parse will not throw an error.
        return JSON.parse(`${this.input.value}`);
    }
}

function shouldJSONParse(type, underlyingType) {
    if ((type === "checkbox")
            || (type === "email")
            || (type === "password")) {
        return false;
    }

    if (underlyingType === "string") {
        return false;
    }

    return true;
}

export {
    Field,
    Result,
};
