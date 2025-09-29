import * as Testing from './testing.js';

const MSECS_PER_SECS = 1000
const MSECS_PER_MINS = MSECS_PER_SECS * 60
const MSECS_PER_HOURS = MSECS_PER_MINS * 60
const MSECS_PER_DAYS = MSECS_PER_HOURS * 24

const TESTING_LOCALE = 'en-US';
const TESTING_TIME_ZONE = 'UTC';

// Find timestamps in a message and replace them with the pretty version.
function messageTimestampsToPretty(message) {
    return message.replace(/<timestamp:\s*(-?\d+)\s*>/g, function(match, timestamp) {
        return timestampToPretty(parseInt(timestamp));
    });
}

function timestampToPretty(timestamp) {
    const date = new Date(timestamp);

    // Return a timestamp in a standard locale and time zone for testing consistency.
    if (Testing.isTestingMode) {
        return date.toLocaleString(TESTING_LOCALE, {
            timeZone: TESTING_TIME_ZONE,
        });
    }

    return date.toLocaleString();
}

export {
    MSECS_PER_SECS,
    MSECS_PER_MINS,
    MSECS_PER_HOURS,
    MSECS_PER_DAYS,

    messageTimestampsToPretty,
    timestampToPretty,
}
