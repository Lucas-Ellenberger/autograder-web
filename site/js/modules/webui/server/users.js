import * as Autograder from '../../autograder/index.js';
import * as Core from '../core/index.js';
import * as Render from '../render/index.js';

function init() {
    Core.Routing.addRoute(Core.Routing.PATH_SERVER_USERS_LIST, handlerUsers, "List Users", Core.Routing.NAV_SERVER);
}

function handlerUsers(path, params, context, container) {
    Render.setTabTitle('List Users');

    let inputFields = [
        new Render.FieldType(context, 'users', 'Target Users', {
            type: '[]model.ServerUserReference',
        }),
    ];

    Render.makePage(
         params, context, container, listServerUsers,
            {
                header: 'List Users',
                description: 'List the users on the server (defaults to all users).',
                inputs: inputFields,
                buttonName: 'List Users',
            },
        )
    ;
}

function listServerUsers(params, context, container, inputParams) {
    return Autograder.Users.list(inputParams.users)
        .then(function(result) {
            if (result.users.length === 0) {
                return '<p>Unable to find target users.</p>';
            }

            Render.apiOutputSwitcher(result.users, container, {
                renderOptions: new Render.APIValueRenderOptions({
                    keyOrdering: ['id', 'email', 'name', 'role', 'type', 'courses'],
                    initialIndentLevel: -1,
                }),
                modes: [
                    Render.API_OUTPUT_SWITCHER_TEXT,
                    Render.API_OUTPUT_SWITCHER_TABLE,
                    Render.API_OUTPUT_SWITCHER_JSON,
                ],
            });

            return undefined;
        })
        .catch(function(message) {
            console.error(message);
            return message;
        })
    ;
}

init();
