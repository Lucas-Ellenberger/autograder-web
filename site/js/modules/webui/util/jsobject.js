// Check if a value is a JS object (and not an Array).
function isObject(value) {
    return (((typeof value) === "object") && !Array.isArray(value) && (value !== null));
}

export {
    isObject,
}
