import * as Core from '../../../../core.js';

function pairwise(submissions, overwriteRecords, waitForCompletion, dryRun) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/analysis/pairwise',
        payload: {
            'dry-run': dryRun,
            'overwrite-records': overwriteRecords,
            'submissions': submissions,
            'wait-for-completion': waitForCompletion,
        },
    });
}

export {
    pairwise,
}
