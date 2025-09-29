import * as Core from './core/index.js';

export * as Core from './core/index.js';
export * as Courses from './courses/index.js';
export * as Log from './log.js';
export * as Render from './render/index.js';
export * as Server from './server/index.js';
export * as Test from './test/index.js';
export * as Util from './util/index.js';

function init() {
    // Start by routing to the desired page.
    Core.Routing.route();
}

export {
    init,
};
