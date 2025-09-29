import * as Strings from './strings.js';

// Compare two values based on where they appear in a given list.
// In one item does not appear in the list, than it will appear latter.
// If neither appear in the list, then fallback to the given comparison function.
function orderingCompare(a, b, ordering = [], fallback = Strings.stringCompare) {
    let aIndex = ordering.indexOf(a);
    let bIndex = ordering.indexOf(b);

    if ((aIndex === -1) && (bIndex === -1)) {
        return fallback(a, b);
    }

    if (bIndex === -1) {
        return -1;
    }

    if (aIndex === -1) {
        return 1;
    }

    if (aIndex === bIndex) {
        return 0;
    }

    if (aIndex < bIndex) {
        return -1;
    }

    return 1;
}

export {
    orderingCompare,
}
