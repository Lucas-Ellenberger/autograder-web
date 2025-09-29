import * as Archive from './archive.js';
import * as Encoding from './encoding.js';

import JSZipExport from '../vendor/jszip.min.js';

// Return a promise to convert a file sent over on the autograder API to a JS File object.
// The autograder sends files as base64 encodings of gzip file contents.
// If successful, the promise will resolve to an uncompressed File object.
function autograderFileToJSFile(b64Text, name = undefined) {
    return Encoding.b64Decode(b64Text).then(Archive.gunzip).then(function(blob) {
        return new File([blob], name);
    });
}

// Return a promise that resolves a standard autograder grading result (model.GradingResult)
// to a JS file object that represents a zip file containing the full result.
// If no filename is provided, the grading result's ID is used.
function autograderGradingResultToJSFile(gradingResult, filename = undefined) {
    const jszip = JSZipExport();

    let archive = jszip();
    let root = archive.folder(gradingResult.info.id);

    if (!filename) {
        filename = `${gradingResult.info.id}.zip`;
    }

    return new Promise(async function(resolve, reject) {
        // Add the base/standard files.
        root.file('info.json', JSON.stringify(gradingResult.info, undefined, 4));
        root.file('stdout.txt', gradingResult.stdout);
        root.file('stderr.txt', gradingResult.stderr);

        // Add directories.
        const dirs = [
            ['input-files-gzip', 'input'],
            ['output-files-gzip', 'output'],
        ];

        for (const [key, dirname] of dirs) {
            let dir = root.folder(dirname);

            for (const [filename, base64Text] of Object.entries(gradingResult[key])) {
                let file = await autograderFileToJSFile(base64Text, filename);
                dir.file(filename, file);
            }
        }

        archive.generateAsync({type: 'blob', compression: 'DEFLATE'}).then(function(blob) {
            let file = new File([blob], filename, {type: 'application/zip'});
            file['__testing_blob_size'] = blob.size;
            resolve(file);
        });
    });
}

export {
    autograderFileToJSFile,
    autograderGradingResultToJSFile,
}
