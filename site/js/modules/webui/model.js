import * as Assignment from './assignment.js';

class InputField {
    constructor(
            name, displayName, param,
            type = 'string', required = false, placeholder = '',
            underlyingType = '', attributes = '', labelBefore = true) {
        this.name = name;
        this.displayName = displayName;
        this.param = param;
        this.type = type;
        this.required = required;
        this.placeholder = placeholder;
        this.underlyingType = underlyingType;
        this.attributes = attributes;
        this.labelBefore = labelBefore;
    }

    validate() {
        if ((this.name == undefined) || (this.name == '')) {
            console.error(`InputField cannot have an empty name: ${JSON.stringify(this)}`);
        }

        if ((this.displayName == undefined) || (this.displayName == '')) {
            console.error(`InputField cannot have an empty display name: ${JSON.stringify(this)}.`);
        }

        if ((this.param == undefined) || (this.param == '')) {
            console.error(`InputField cannot have an empty param: ${JSON.stringify(this)}.`);
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

    // TODO: Need a good way to extract complex values.
    getValue(container) {
        let input = container.querySelector(`fieldset [name=${this.name}`);

        let value = undefined;
        if (this.type === 'checkbox') {
            value = input.checked;
        } else {
            value = input.value;
        }

        return value;
    }
}

export {
    InputField,
};
