import * as Autograder from '../../autograder/index.js';
import * as Context from './context.js';
import * as Render from '../render/index.js';
import * as Routing from './routing.js';

function init() {
    Routing.addRoute(Routing.PATH_LOGIN, handlerLogin, 'Login', Routing.NAV_EMPTY, {login: false});
    Routing.addRoute(Routing.PATH_LOGOUT, handlerLogout, 'Logout');
}

function handlerLogin(path, params, context, container) {
    let inputFields = [
        new Render.FieldType(context, 'email', 'Email', {
            type: Render.INPUT_TYPE_EMAIL,
            required: true,
            placeholder: 'email',
        }),
        new Render.FieldType(context, 'cleartext', 'Password', {
            type: Render.INPUT_TYPE_PASSWORD,
            required: true,
            placeholder: 'password / token',
        }),
    ];

    Render.makePage(
            params, context, container, login,
            {
                inputs: inputFields,
                buttonName: 'Login',
            },
        )
    ;
}

function login(params, context, container, inputParams) {
    if (Autograder.hasCredentials()) {
        return Promise.resolve(`
            <p>Already logged in.</p>
            <p>Logout first to login again.</p>
        `);
    }

    return Autograder.Users.Tokens.create(inputParams.email, inputParams.cleartext)
        .then(function(token) {
            Autograder.setCredentials(inputParams.email, token['token-id'], token['token-cleartext']);
            Routing.redirectHome();
            return `<p>Successfully logged in.</p>`;
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

function handlerLogout(path, params, context, container) {
    Context.clear();
    Autograder.clearCredentials();
    Routing.redirectLogin();
}

init();

export {
    login,
};
