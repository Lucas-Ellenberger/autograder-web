import * as Icon from './icon.js'
import * as Render from './render.js'
import * as Routing from './routing.js'

function init() {
    Routing.addRoute(/^$/, handlerHome, 'Home', Routing.NAV_PARENT_HOME);
}

function handlerHome(path, params, context, container) {
    container.innerHTML = `
        <div class='home-page'>
            <div class='home-content'>
                <div class='home-title secondary-color drop-shadow'>
                    <div class='page-image secondary-accent-color-bg-low'>
                        ${Icon.getIconHTML(Icon.ICON_NAME_HOME)}
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
