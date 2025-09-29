import * as AGFile from './agfile.js';

test("autograderGradingResultToJSFile() base", async function() {
    const expectedBytes = 2207;
    const epsilonBytes = 5;

    // Key an API test case that has a grading result.
    const key = "{\"arguments\":{\"assignment-id\":\"hw0\",\"course-id\":\"course101\",\"target-email\":\"course-student@test.edulinq.org\",\"user-email\":\"course-admin@test.edulinq.org\",\"user-pass\":\"c22755f48fa0ef601e8d57a3ba169eeda80e9b2d4eaecc2c2ca2ffc887722f7c\"},\"endpoint\":\"courses/assignments/submissions/fetch/user/attempt\",\"files\":[]}";

    let data = testData[key];
    expect(data).toBeDefined();

    let gradingResult = data['output']['grading-result'];
    expect(gradingResult).toBeDefined();

    // Ensure that the file is approximately the size we expect.
    // There may be slight variations depending on the OS and randomization.
    let file = await AGFile.autograderGradingResultToJSFile(gradingResult, 'test.zip');
    expect(file.__testing_blob_size).toBeGreaterThanOrEqual(expectedBytes - epsilonBytes);
    expect(file.__testing_blob_size).toBeLessThanOrEqual(expectedBytes + epsilonBytes);
});

