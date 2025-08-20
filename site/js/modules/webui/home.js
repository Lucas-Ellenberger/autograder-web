import * as Routing from './routing.js'

function init() {
    Routing.addRoute(/^$/, handlerHome, 'Home');
}

function handlerHome(path, params, context, container) {
    container.innerHTML = `
        <div class='home-page'>
            <div class='home-content'>
                <div class='home-title secondary-color drop-shadow'>
                    <div class='page-image low-bg-accent-color'>
                        <img class='light-only' src='images/vendor/github-mark.png'>
                        <img class='dark-only' src='images/vendor/github-mark-white.png'>
                    </div>
                    <p>
                        Welcome to the EduLinq Autograder.
                    </p>
                </div>

                <div class='secondary-color drop-shadow'>
                    <p>
                        You are currently using the <a href='https://github.com/edulinq/autograder-web'>web frontend</a>
                        for the autograder running on <a href='${document.location.href}'><strong>${document.location.hostname}</strong></a>.
                    </p>

                    <p>
                        This frontend has a subset of the full functionality,
                        which you access with command-line clients such as the <a href='https://github.com/edulinq/autograder-py'>Python CLI</a>.
                    </p>
                </div>

                <div class='secondary-color drop-shadow'>
                    <span>Other EduLinq Autograder Resources:</span>
                    <ul>
                        <li><a href='https://github.com/edulinq/autograder-server'>Server</a></li>
                        <li><a href='https://github.com/edulinq/autograder-web'>Web Frontend</a></li>
                        <li><a href='https://github.com/edulinq/autograder-py'>Python Interface</a></li>
                    </ul>
                </div>
            </div>
        </home>
    `;
}

export {
    init,
}
