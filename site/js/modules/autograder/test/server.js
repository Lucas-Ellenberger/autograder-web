import fs from 'node:fs';
import path from 'node:path';

import * as Core from '../core.js'
import * as Util from '../util.js'

var testData = {}

const DEFAULT_ID_EMAIL = 'server-admin@test.edulinq.org';
const DEFAULT_ID_CLEARTEXT = 'server-admin';

// Mock fetch to use our test data.
global.fetch = function(url, options = {}) {
    let endpoint = url.replace(/^\/api\/v\d+\//, '');
    let content = JSON.parse(options.body.get('content'));

    // Create arguments by lexicographically traversing the content.
    let args = {};
    for (const key of Object.keys(content).sort()) {
        args[key] = content[key]
    }

    let keyData = {
        'arguments': args,
        'endpoint': endpoint,
        'files': [],
    };
    let key = JSON.stringify(keyData);

    let responseContent = testData[key];
    if (!responseContent) {
        console.error(keyData);
        throw new Error(`Unknown API key: '${key}'.`);
    }

    let responseData = {
        'id': '00000000-0000-0000-0000-000000000000',
        'locator': '',
        'server-version': '0.0.0',
        'start-timestamp': Util.getTimestampNow(),
        'end-timestamp': Util.getTimestampNow(),
        'status': 200,
        'success': true,
        'message': responseContent.message ?? '',
        'content': responseContent.output,
    };

    return Promise.resolve({
        json: function() {
            return Promise.resolve(responseData);
        },
        text: function() {
            return Promise.resolve(responseData.message);
        },
    });
}

// Load the test data from ./api_test_data.json.
function loadAPITestData() {
    const text = fs.readFileSync(path.join('site', 'js', 'modules', 'autograder', 'test', 'api_test_data.json'), 'utf8');
    testData = JSON.parse(text)
}

// Load the default testing identity.
function loadAPITestIdentity() {
    Core.setCredentials(DEFAULT_ID_EMAIL, 'test', DEFAULT_ID_CLEARTEXT);
}

beforeAll(function() {
    loadAPITestData();
    loadAPITestIdentity();
});
