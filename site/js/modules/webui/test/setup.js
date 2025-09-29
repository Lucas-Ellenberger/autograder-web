import '../index.js';  // Import to cascade import the whole web UI.
import * as Util from '../util/index.js';

function init() {
    Util.setTestingMode(true);
}

beforeEach(function() {
    init();
});
