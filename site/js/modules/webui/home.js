import * as Routing from './routing.js'

function init() {
    Routing.addRoute(/^$/, handlerHome, 'Home');
}

function handlerHome(path, params, context, container) {
    container.innerHTML = `
        <div class='home'>
            <p>
                Welcome to the EduLinq Autograder.
            </p>

            <p>
                You are currently using the <a href='https://github.com/edulinq/autograder-web'>web frontend</a>
                for the autograder running on <a href='${document.location.href}'><strong>${document.location.hostname}</strong></a>.
            </p>

            <p>
                This frontend has a subset of the full functionality,
                which you access with command-line clients such as the <a href='https://github.com/edulinq/autograder-py'>Python CLI</a>.
            </p>

            <span>Other EduLinq Autograder Resources:</span>
            <ul>
                <li><a href='https://github.com/edulinq/autograder-server'>Server</a></li>
                <li><a href='https://github.com/edulinq/autograder-web'>Web Frontend</a></li>
                <li><a href='https://github.com/edulinq/autograder-py'>Python Interface</a></li>
            </ul>
        </home>
    `;
}

export {
    init,
}
