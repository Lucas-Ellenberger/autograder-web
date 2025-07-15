import * as Autograder from '../autograder/base.js';

class Field {
    constructor(
            name, displayName, param,
            {
                type = 'string', required = false, placeholder = '',
                attributes = '', labelBefore = true, marshalFunc = undefined
            } = {}) {
        this.name = name;
        this.displayName = displayName;
        this.param = param;
        this.type = type;
        this.required = required;
        this.placeholder = placeholder;
        this.attributes = attributes;
        this.labelBefore = labelBefore;
        this.marshalFunc = marshalFunc;
    }

    validate() {
        if ((this.name == undefined) || (this.name == '')) {
            console.error(`Input field cannot have an empty name: ${JSON.stringify(this)}`);
        }

        if ((this.displayName == undefined) || (this.displayName == '')) {
            console.error(`Input field cannot have an empty display name: ${JSON.stringify(this)}.`);
        }

        if ((this.param == undefined) || (this.param == '')) {
            console.error(`Input field cannot have an empty param: ${JSON.stringify(this)}.`);
        }
    }

    toHTML() {
        this.validate();

        let attributes = this.attributes;
        if (this.required) {
            attributes += ' required';
        }

        const label = `<label for="${this.name}">${this.displayName}</label>`;
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

    getParam() {
        return this.param;
    }

    getValue(container) {
        let input = container.querySelector(`fieldset [name=${this.name}`);
        input.classList.add("touched");

        let value = undefined;
        if (this.marshalFunc) {
            value = this.marshalFunc(input);
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
