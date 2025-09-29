function removeUndefinedValues(object) {
    for (const [key, value] of Object.entries(object)) {
        // Clear key ONLY if value is explicitly undefined.
        if (value === undefined) {
            delete object[key];
        }
    }
}

export {
    removeUndefinedValues,
}
