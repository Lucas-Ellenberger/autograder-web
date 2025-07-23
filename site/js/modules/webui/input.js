const PATTERN_INT = /^int\d*$/;
const PATTERN_TARGET_USER = /^core\.Target((Course)|(Server))User$/;
const PATTERN_TARGET_SELF_OR = /^core\.Target((Course)|(Server))UserSelfOr[a-zA-Z]+$/;

// The set of valid types for a FieldType.
// TODO: Use objects instead.
const validFieldTypes = new Map([
    ["checkbox", {}],
    ["email", {}],
    ["number", {}],
    ["password", {}],
    ["select", {}],
    ["text", {}],
    ["json", {}],
]);

const standardUnderlyingTypes = new Map([
    ["string", {}],
    ["bool", {}],
]);

const standardUnderlyingTypePatterns = [
    PATTERN_INT,
];

function isStandardType(type) {
    if (standardUnderlyingTypes.get(type) != undefined) {
        return true;
    }

    for (const pattern of standardUnderlyingTypePatterns) {
        if (pattern.test(type)) {
            return true;
        }
    }

    return false;
}

// A general representation of a user input field.
// The FieldType is responsible for generating and validating the HTML of a field.
class FieldType {
    #parsedType = undefined;

    // TODO: Rename type to type and type can become #parsedType
    // TODO: Add support for default values, this may mean the select dropdown accepts the name of the option that should be defaulted.
    // -- this will remove the need for the selected bool parameter for the option class constructor.
    constructor(
            context, name, displayName,
            {
                type = 'string', parsedType = undefined, required = false, placeholder = '',
                inputClasses = '', additionalAttributes = '', choices = [],
                labelBefore = true, extractInputFunc = undefined, inputValidationFunc = undefined,
            }) {
        // The name of the field.
        this.name = name;

        // The display name that will be shown to the user.
        this.displayName = displayName;

        // The field type.
        // Non-standard types are parsed to JSON.
        // If a non-standard type cannot be parsed to JSON,
        // a validation error is raised.
        this.type = type;

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
        // Only used when the parsedType is "select".
        this.choices = choices;

        // Determines the position of the HTML label with respect to the input.
        this.labelBefore = labelBefore;

        // A custom function for extracting the value from an input.
        // If a default value extraction cannot be inferred, the value is parsed using JSON.
        this.extractInputFunc = extractInputFunc;

        // A custom input validation function.
        // The validity state of the input is checked before calling this custom validation function.
        this.inputValidationFunc = inputValidationFunc;

        this.#parsedType = parsedType;
        if (this.#parsedType == undefined) {
            this.inferFieldInformation(context);
        }

        this.validate();
    }

    validate() {
        if ((this.name == undefined) || (this.name == '')) {
            console.error(`Input field cannot have an empty name: '${JSON.stringify(this)}'.`);
        }

        if ((this.displayName == undefined) || (this.displayName == '')) {
            console.error(`Input field cannot have an empty display name: '${JSON.stringify(this)}'.`);
        }

        if ((this.#parsedType == undefined) || (this.#parsedType == '')) {
            console.error(`Input field cannot have an empty parsed type: '${JSON.stringify(this)}'.`);
        }

        if (!this.isValidType()) {
            console.error(`Input field contains an invalid parsed type: '${JSON.stringify(this.#parsedType)}'.`);
        }
    }

    isValidType() {
        if (validFieldTypes.get(this.#parsedType) == undefined) {
            return false;
        }

        return true;
    }

    // Using the context and the underlying type,
    // infer the HTML input type and metadata.
    // This function must be called exactly once when the FieldType is created.
    inferFieldInformation(context) {
        if (this.type === "string") {
            this.#parsedType = "text";
        } else if (PATTERN_TARGET_SELF_OR.test(this.type)) {
            this.#parsedType = "email";
            this.placeholder = context.user.email;
        } else if (PATTERN_TARGET_USER.test(this.type)) {
            this.#parsedType = "email";
        } else if (PATTERN_INT.test(this.type)) {
            this.#parsedType = "number";
            this.inputClasses += ` pattern="\d*"`;
        } else if (this.type === "bool") {
            this.#parsedType = "checkbox";
            this.inputClasses += " checkbox-field";
            this.additionalAttributes += ` value="true"`;
            this.labelBefore = false;
        } else if (this.type === "select") {
            this.#parsedType = "select";
        } else {
            this.#parsedType = "text";
            this.displayName += ` (expects: ${this.type})`;
        }

        // Due to the context credentials, remind the user the email and pass fields are optional.
        if (this.name === "user-email") {
            this.#parsedType = "email";
            this.placeholder = context.user.email;
        } else if (this.name === "user-pass") {
            this.#parsedType = "password";
            this.placeholder = "<current token>";
        }

        if ((this.required) && (this.placeholder === "")) {
            this.additionalAttributes += ' required';
            this.displayName += ` <span class="required-color">*</span>`;
        }
    }

    toHTML() {
        let listOfFieldHTML = [
            `<label for="${this.name}">${this.displayName}</label>`,
        ];

        if (this.#parsedType === "select") {
            let choices = this.choices;

            // Add a help message as the first choice of the select.
            choices.unshift(new SelectOption("", "--Please choose an option--"));

            listOfFieldHTML.push(
                `
                    <select id="${this.name}" name="${this.name}" class="tertiary-color" ${this.additionalAttributes}>
                        ${getSelectOptionsHTML(choices)}
                    </select>
                `
            );
        } else {
            listOfFieldHTML.push(
                `<input type="${this.#parsedType}" id="${this.name}" name="${this.name}" class="tertiary-color"placeholder="${this.placeholder}" ${this.additionalAttributes}/>`,
            );
        }

        if (!this.labelBefore) {
            listOfFieldHTML.reverse();
        }

        return `
            <div class="input-field ${this.inputClasses}">
                ${listOfFieldHTML.join("\n")}
            </div>
        `;
    }

    getFieldInstance(container) {
        let input = container.querySelector(`fieldset [name="${this.name}"]`);
        input.classList.add("touched");

        return new FieldInstance(input, this.type, this.extractInputFunc, this.inputValidationFunc);
    }
}

// The FieldInstance class is responsible for validating and getting the user input from a FieldType.
// Each FieldType is created once, but it creates a new FieldInstance whenever the user input is needed.
class FieldInstance {
    constructor(input, type, extractInputFunc = undefined, inputValidationFunc = undefined) {
        // The input from the Input.FieldType's element.
        this.input = input;

        if (this.input == undefined) {
            throw new Error("Cannot instantiate a field with an undefined input.");
        }

        // See FieldType for field descriptions.
        this.type = type;
        this.extractInputFunc = extractInputFunc;
        this.inputValidationFunc = inputValidationFunc;

        try {
            this.validate();
        } catch (error) {
            throw new Error(`<p>FieldType "${this.input.name}": "${error.message}".</p>`);
        }

    }

    // Validate the value of the input.
    // Throws an error on invalid input values.
    validate() {
        if (!this.input.validity.valid) {
            throw new Error(`${this.input.validationMessage}`);
        }

        if (!this.input.checkValidity()) {
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
            if (this.input.required) {
                console.log(this.input);
                throw new Error('Please input a non-empty string.');
            }

            // TODO: Fix required case providing an empty input.
            console.log(`shoot: '${this.input.name}', '${this.input.required}'.\n`);
            return;
        }

        // Try to parse non-standard field types.
        if (shouldJSONParse(this.type, this.input.type)) {
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
        if (this.extractInputFunc) {
            return this.extractInputFunc(this.input);
        }

        if (this.input == undefined) {
            return undefined;
        }

        let value = undefined;
        if (this.input.type === "checkbox") {
            value = this.input.checked;
        } else if (shouldJSONParse(this.type, this.input.type)) {
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

// TODO: Move this to a method.
function shouldJSONParse(type, inputType) {
    if (isStandardType(type)) {
        return false;
    }

    if ((inputType === "checkbox")
            || (inputType === "email")
            || (inputType === "password")
            || (inputType === "select")) {
        return false;
    }

    return true;
}

// Returns the HTML for the list of SelectOptions.
function getSelectOptionsHTML(choices) {
    let optionsList = [];

    for (const choice of choices) {
        optionsList.push(choice.toHTML());
    }

    return optionsList.join("\n");
}

export {
    FieldInstance,
    FieldType,
    SelectOption,
};
