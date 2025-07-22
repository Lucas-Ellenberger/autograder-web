const PATTERN_INT = /^int\d*$/;
const PATTERN_TARGET_USER = /^core\.Target((Course)|(Server))User$/;
const PATTERN_TARGET_SELF_OR = /^core\.Target((Course)|(Server))UserSelfOr[a-zA-Z]+$/;

// A general representation of a user input field.
class FieldType {
    constructor(
            context, name, displayName,
            {
                underlyingType = 'string', required = false, placeholder = '',
                inputClasses = '', additionalAttributes = '', selectOptions = [],
                labelBefore = true, extractInputFunc = undefined, inputValidationFunc = undefined,
            } = {}) {
        // The name of the field.
        this.name = name;

        // The display name that will be shown to the user.
        this.displayName = displayName;

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
        this.inputClasses = inputClasses;

        // Any additional attributes to the input field.
        // If the field is required, the required attribute will be added automatically.
        this.additionalAttributes = additionalAttributes;

        // A list of SelectOptions.
        // Only used when the underlyingType is select.
        this.selectOptions = selectOptions;

        // Determines the position of the HTML label with respect to the input.
        this.labelBefore = labelBefore;

        // A custom function for extracting the value from an input.
        // If a default value extraction cannot be inferred, the value is parsed using JSON.
        this.extractInputFunc = extractInputFunc;

        // A custom input validation function.
        // The validity state of the input is checked before calling this custom validation function.
        this.inputValidationFunc = inputValidationFunc;

        this.type = undefined;
        this.inferInput(context);

        this.validate();
    }

    validate() {
        if ((this.name == undefined) || (this.name == '')) {
            console.error(`Input field cannot have an empty name: '${JSON.stringify(this)}'.`);
        }

        if ((this.displayName == undefined) || (this.displayName == '')) {
            console.error(`Input field cannot have an empty display name: '${JSON.stringify(this)}'.`);
        }

        if ((this.type == undefined) || (this.type == '')) {
            console.error(`Input field cannot have an empty type: '${JSON.stringify(this)}'.`);
        }

        if (!this.isValidType()) {
            console.error(`Input field contains an invalid type: '${JSON.stringify(this.type)}'.`);
        }
    }

    isValidType() {
        if ((this.type === "checkbox")
                || (this.type === "email")
                || (this.type === "number")
                || (this.type === "password")
                || (this.type === "select")
                || (this.type === "text")) {
            return true;
        }

        return false;
    }

    // Using the context and the underlying type,
    // infer the HTML input type and metadata.
    // This function must be called exactly once when the FieldType is created.
    inferInput(context) {
        if (this.underlyingType === "string") {
            this.type = "text";
        } else if (PATTERN_TARGET_SELF_OR.test(this.underlyingType)) {
            this.type = "email";
            this.placeholder = context.user.email;
        } else if (PATTERN_TARGET_USER.test(this.underlyingType)) {
            this.type = "email";
        } else if (PATTERN_INT.test(this.underlyingType)) {
            this.type = "number";
            this.inputClasses += ` pattern="\d*"`;
        } else if (this.underlyingType === "bool") {
            this.type = "checkbox";
            this.inputClasses += " checkbox-field";
            this.additionalAttributes += ` value="true"`;
            this.labelBefore = false;
        } else if (this.underlyingType === "select") {
            this.type = "select";
        } else {
            this.type = "text";
            this.displayName += ` (expects: ${this.underlyingType})`;
        }

        // Due to the context credentials, remind the user the email and pass fields are optional.
        if (this.name === "user-email") {
            this.type = "email";
            this.placeholder = context.user.email;
        } else if (this.name === "user-pass") {
            this.type = "password";
            this.placeholder = "<current token>";
        }

        if ((this.required) && (this.placeholder === "")) {
            this.additionalAttributes += ' required';
            this.displayName += ` <span class="required-color">*</span>`;
        }
    }

    toHTML() {
        let inputFieldHTML = [];
        if (this.type === "select") {
            inputFieldHTML = [
                // Do not include the displayName in select labels as it clutters the dropdown.
                `<label for="${this.name}"></label>`,
                `
                    <select id="${this.name}" name="${this.name}" class="${this.inputClasses}" ${this.additionalAttributes}>
                        ${getSelectOptionsHTML(this.selectOptions)}
                    </select>
                `,
            ];
        } else {
            inputFieldHTML = [
                `<label for="${this.name}">${this.displayName}</label>`,
                `<input type="${this.type}" id="${this.name}" name="${this.name}" placeholder="${this.placeholder}" ${this.additionalAttributes}/>`,
            ];
        }

        if (!this.labelBefore) {
            inputFieldHTML.reverse();
        }

        return `
            <div class="input-field ${this.inputClasses}">
                ${inputFieldHTML.join("\n")}
            </div>
        `;
    }

    getFieldInstance(container) {
        let input = container.querySelector(`fieldset [name="${this.name}"]`);
        input.classList.add("touched");

        return new FieldInstance(input, this.underlyingType, this.extractInputFunc, this.inputValidationFunc);
    }
}

// An instance of getting an Input.FieldType.
class FieldInstance {
    constructor(input, underlyingType, extractInputFunc = undefined, inputValidationFunc = undefined) {
        // The input from the query selector.
        this.input = input;

        if (this.input == undefined) {
            throw new Error("Cannot instantiate a field with an undefined input.");
        }

        // See FieldType for field descriptions.
        this.underlyingType = underlyingType;
        this.extractInputFunc = extractInputFunc;
        this.inputValidationFunc = inputValidationFunc;
    }

    // Validate the value of the input.
    // Throws an error on invalid input values.
    validate() {
        if (!this.input.validity.valid) {
            throw new Error(`${this.input.validationMessage}`);
        }

        if (this.inputValidationFunc != undefined) {
            this.inputValidationFunc(this.input);
            return;
        }

        // Skip further validation if a custom extraction function is provided.
        if (this.extractInputFunc != undefined) {
            return;
        }

        if (this.input.value === "") {
            return;
        }

        // Try to parse non-standard field types.
        if (shouldJSONParse(this.input.type, this.underlyingType)) {
            // Throws an error on failure.
            JSON.parse(`${this.input.value}`);
        }
    }

    getName() {
        return this.input.name;
    }

    // Get the value from the result.
    // Throws an error on validation errors.
    getValue() {
        try {
            this.validate();
        } catch (error) {
            throw new Error(`<p>FieldType "${this.input.name}": "${error.message}".</p>`);
        }

        if (this.extractInputFunc) {
            return this.extractInputFunc(this.input);
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

class SelectOption {
    constructor(value, displayName = value, selected = false) {
        this.value = value;
        this.displayName = displayName;
        this.selected = selected;
    }

    toHTML() {
        let isSelected = '';
        if (this.selected) {
            isSelected = ' selected';
        }

        return `<option value="${this.value}"${isSelected}>${this.displayName}</option>`;
    }
}

function shouldJSONParse(type, underlyingType) {
    if ((type === "checkbox")
            || (type === "email")
            || (type === "password")
            || (type === "select")) {
        return false;
    }

    if (underlyingType === "string") {
        return false;
    }

    return true;
}

// Returns the HTML for the list of SelectOptions.
function getSelectOptionsHTML(selectOptions) {
    let optionsList = [];

    for (const option of selectOptions) {
        optionsList.push(option.toHTML());
    }

    return optionsList.join("\n");
}

export {
    FieldInstance,
    FieldType,
    SelectOption,
};
