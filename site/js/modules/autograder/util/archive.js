// Take in a blob representing gzipped data,
// and return a promise that will resolve to a Blob of the uncompressed gzipped data.
function gunzip(gzipBlob) {
    const decompression = new DecompressionStream('gzip');
    const decompressedStream = gzipBlob.stream().pipeThrough(decompression);
    return (new Response(decompressedStream)).blob();
}

export {
    gunzip,
}
