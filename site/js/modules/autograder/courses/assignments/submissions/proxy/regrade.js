import * as Core from '../../../../core.js';

function regrade(course, assignment, dryRun, overwriteRecords, waitForCompletion, regradeCutoff = undefined, targetUsers = undefined) {
    return Core.sendRequest({
        endpoint: 'courses/assignments/submissions/proxy/regrade',
        payload: {
            'course-id': course,
            'assignment-id': assignment,
            'dry-run': dryRun,
            'overwrite-records': overwriteRecords,
            'wait-for-completion': waitForCompletion,
            'regrade-cutoff': regradeCutoff,
            'target-users': targetUsers,
        },
    });
}

export {
    regrade,
}
