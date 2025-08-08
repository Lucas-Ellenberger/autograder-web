import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import * as Core from '../core.js'
import * as Util from '../util.js'

import * as TestUtil from './util.js'

var testData = {}

const DEFAULT_ID_EMAIL = 'server-admin@test.edulinq.org';
const DEFAULT_ID_CLEARTEXT = 'server-admin';

global.URL = url.URL;

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

    // Update the filler token cleartext to match the test user's name.
    // This token is hashed and used as part of the lookup key for subsequent API calls.
    // The test data expects the user's pass to match their name (not the token).
    if (endpoint === 'users/tokens/create') {
        responseContent.output['token-cleartext'] = parseRequestUserName(content);
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

function parseRequestUserName(content) {
    let email = content["user-email"];
    return email.split('@')[0];
}

// Load the site's HTML into the document.
async function loadHTML() {
    const html = fs.readFileSync(path.join('site', 'index.html'), 'utf8');
    document.documentElement.innerHTML = html;

    await TestUtil.waitForDOMChange('.page-body');
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
    loadHTML();
    loadAPITestData();
    loadAPITestIdentity();
});
