// Convert a base64 string to a Blob,
// block until the result is ready.
function b64DecodeBlock(b64Text) {
    // Convert the base64 string to a byte string.
    const byteString = atob(b64Text);

    // Convert the bytes from characters to ints.
    const bytes = new Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
        bytes[i] = byteString.charCodeAt(i);
    }

    // Construct a blob.
    return new Blob([new Uint8Array(bytes)]);
}

// Convert a base64 string to a Blob,
// return a promise the resolves to the result.
function b64Decode(b64Text) {
    return new Promise(function(resolve, reject) {
        try {
            resolve(b64DecodeBlock(b64Text));
        } catch (error) {
            reject(error);
        }
    });
}

export {
    b64Decode,
}
